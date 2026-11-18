import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../context/AuthContext';
import {
  fetchUserByUsername,
  fetchStudentById,
  fetchStudentProfileByStudentId,
  fetchJobApplications,
  fetchInterviews,
  updateStudentProfile,
  createSkill,
  createCertificate,
  linkStudentProfile
} from '../../services/api';

export default function StudentProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState({ activeApps: 0, interviews: 0 });
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [showAddCert, setShowAddCert] = useState(false);

  // Form States
  const [editForm, setEditForm] = useState({ department: '', batch: '', phone: '', cgpa: '' });
  const [skillForm, setSkillForm] = useState({ name: '', category: '' });
  const [certForm, setCertForm] = useState({ name: '', issuedDate: '' });



const loadData = async () => {
  try {
    setLoading(true);

    let studentObj;

    // Admin / Placement Officer: load selected student
    if (id) {
      studentObj = await fetchStudentById(id);
    }
    // Student: load logged-in student's own details
    else if (user?.username) {
      let userObj = await fetchUserByUsername(user.username);

      if (!userObj?.student?.id) {
        await linkStudentProfile();
        userObj = await fetchUserByUsername(user.username);
      }

      studentObj = userObj?.student;
    }

    if (!studentObj?.id) {
      throw new Error('Student details not found');
    }

    // Fetch the actual StudentProfile, including skills
    const profileObj = await fetchStudentProfileByStudentId(
      studentObj.id
    );

    // Attach profile to student data
    studentObj = {
      ...studentObj,
      studentProfile: profileObj
    };

    setProfileData({ student: studentObj });

    // Load application and interview statistics
    const [allApps, allInts] = await Promise.all([
      fetchJobApplications().catch(() => []),
      fetchInterviews().catch(() => [])
    ]);

    const myApps = allApps.filter(
      a => a.student?.id === studentObj.id
    );

    const myJobPostingIds = myApps.map(
      a => a.jobPosting?.id
    );

    const myInts = allInts.filter(
      i => myJobPostingIds.includes(i.jobPosting?.id)
    );

    setStats({
      activeApps: myApps.length,
      interviews: myInts.length
    });

  } catch (err) {
    console.error("Failed to load student profile:", err);
    setProfileData(null);
  } finally {
    setLoading(false);
  }
};

 useEffect(() => {
   if (id || user?.username) {
     loadData();
   }
 }, [id, user?.username]);

  const handleEditProfile = () => {
    const profile = profileData?.student?.studentProfile || {};
    setEditForm({
      department: profile.department || '',
      batch: profile.batch || '',
      phone: profile.phone || '',
      cgpa: profile.cgpa || ''
    });
    setShowEditProfile(true);
  };

  const submitEditProfile = async (e) => {
    e.preventDefault();
    try {
      const profileId = profileData?.student?.studentProfile?.id;
      if (!profileId) {
        alert("Profile ID not found. Ensure backend assigns one.");
        return;
      }
      const updatedProfile = { 
        ...profileData.student.studentProfile, 
        ...editForm,
        cgpa: editForm.cgpa ? parseFloat(editForm.cgpa) : null
      };
      await updateStudentProfile(profileId, updatedProfile);
      setShowEditProfile(false);
      loadData(); // Reload to show changes
    } catch (error) {
      alert("Failed to update profile.");
    }
  };

  const submitAddSkill = async (e) => {
    e.preventDefault();
    try {
      const savedSkill = await createSkill(skillForm);
      const profileId = profileData?.student?.studentProfile?.id;
      if (profileId) {
        const currentSkills = profileData.student.studentProfile.skills || [];
        await updateStudentProfile(profileId, {
          ...profileData.student.studentProfile,
          skills: [...currentSkills, savedSkill]
        });
      }
      setShowAddSkill(false);
      setSkillForm({ name: '', category: '' });
      loadData();
    } catch (error) {
      alert("Failed to add skill.");
    }
  };

  const submitAddCert = async (e) => {
    e.preventDefault();
    try {
      const studentId = profileData?.student?.id;
      if (!studentId) return;
      await createCertificate({
        ...certForm,
        student: { id: studentId }
      });
      setShowAddCert(false);
      setCertForm({ name: '', issuedDate: '' });
      loadData();
    } catch (error) {
      alert("Failed to add certificate.");
    }
  };

  if (loading) return <div className="p-4 text-center">Loading profile...</div>;

  const student = profileData?.student || {};
  const profile = student?.studentProfile || {};
  const fullName = `${student.firstName || 'Student'} ${student.lastName || ''}`.trim();
  const initials = fullName.substring(0, 2).toUpperCase() || 'ST';
  const skills = profile.skills || [];
  const certificates = student.certificates || profile.certificates || [];

  return (
    <div className="d-flex flex-column gap-4 position-relative">
      <PageHeader 
        title="Student Profile" 
        subtitle="View detailed placement readiness and application status."
        primaryAction={{ 
          label: "Edit profile", 
          icon: "bi-pencil-square", 
          onClick: handleEditProfile
        }}
        secondaryAction={{
          label: "Back",
          icon: "bi-arrow-left",
          onClick: () => navigate('/students')
        }}
      />

      {/* Hero Section */}
      <div className="card shadow-sm border-0 overflow-hidden bg-white">
        <div className="card-body p-4 d-flex flex-column flex-md-row align-items-start align-items-md-center gap-4">
          <div className="text-white rounded-4 d-flex justify-content-center align-items-center fw-bolder shadow-sm flex-shrink-0" style={{width: '80px', height: '80px', fontSize: '2rem', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))'}}>
            {initials}
          </div>
          
          <div className="flex-grow-1">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-1">
              <h3 className="fw-bold mb-0 text-dark">{fullName}</h3>
              <span className="badge bg-success-subtle text-success px-3 py-2 fw-medium mt-2 mt-md-0 d-inline-flex align-items-center gap-2 rounded-pill">
                <i className="bi bi-check-circle-fill"></i> Profile Complete
              </span>
            </div>
            
            <p className="text-muted fw-medium mb-3" style={{fontSize: '0.95rem'}}>
              {profile.department || 'General'} · {profile.batch || 'Batch Unknown'}
            </p>
            
            <div className="d-flex flex-wrap gap-4 text-muted" style={{fontSize: '0.875rem'}}>
              <div className="d-flex align-items-center gap-2"><i className="bi bi-envelope"></i> {student.email || profileData?.email || 'No email provided'}</div>
              <div className="d-flex align-items-center gap-2"><i className="bi bi-telephone"></i> {profile.phone || 'No phone'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="row g-4">
        {/* Left Column (Main Info) */}
        <div className="col-12 col-lg-8 d-flex flex-column gap-4">
          
          {/* Skills */}
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h5 className="fw-semibold mb-1 text-dark">Skills</h5>
                  <p className="text-muted mb-0" style={{fontSize: '0.875rem'}}>Validated technical and professional skills</p>
                </div>
                <button
                  onClick={() => setShowAddSkill(true)}
                  className="btn btn-light text-primary rounded-circle d-flex align-items-center justify-content-center p-2"
                  style={{width: '36px', height: '36px'}}
                >
                  <i className="bi bi-plus-lg"></i>
                </button>
              </div>
              
              <div className="d-flex flex-wrap gap-2">
                {skills.length === 0 ? <span className="text-muted">No skills added yet.</span> : skills.map((skill, i) => (
                  <span key={skill.id || i} className={`badge rounded-pill fw-medium px-3 py-2 bg-primary-subtle text-primary`} style={{fontSize: '0.8125rem'}}>
                    {skill.name || skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Certificates */}
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h5 className="fw-semibold mb-1 text-dark">Certificates</h5>
                  <p className="text-muted mb-0" style={{fontSize: '0.875rem'}}>Credentials verified by the placement cell</p>
                </div>
                <button 
                  onClick={() => setShowAddCert(true)}
                  className="btn btn-light text-primary rounded-circle d-flex align-items-center justify-content-center p-2" 
                  style={{width: '36px', height: '36px'}}
                >
                  <i className="bi bi-plus-lg"></i>
                </button>
              </div>
              
              <div className="list-group list-group-flush">
                {certificates.length === 0 ? <p className="text-muted">No certificates uploaded.</p> : certificates.map((cert, i) => (
                  <div key={cert.id || i} className="list-group-item px-0 py-3 border-light d-flex align-items-start gap-3 bg-transparent">
                    <div className="bg-warning-subtle text-warning rounded p-2 d-flex align-items-center justify-content-center mt-1">
                      <i className="bi bi-award fs-5"></i>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="fw-medium mb-1 text-dark">{cert.name}</h6>
                      <p className="text-muted mb-0" style={{fontSize: '0.8125rem'}}>Issued: {cert.issuedDate}</p>
                    </div>
                    <span className="badge bg-success-subtle text-success rounded-pill px-3 py-1 fw-medium" style={{fontSize: '0.75rem'}}>Verified</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
        </div>

        {/* Right Column (Sidebar stats) */}
        <div className="col-12 col-lg-4 d-flex flex-column gap-4">
          {/* Readiness */}
          <div className="card shadow-sm border-0 text-center">
            <div className="card-body p-4">
              <h5 className="fw-semibold mb-4 text-dark">Placement readiness</h5>
              
              <div className="position-relative d-inline-flex justify-content-center align-items-center mb-3" style={{width: '100px', height: '100px'}}>
                <div className="spinner-border text-primary" style={{width: '100px', height: '100px', borderWidth: '6px'}} role="status"></div>
                <span className="position-absolute fw-bold fs-4 text-dark">{profile.cgpa ? '100%' : '50%'}</span>
              </div>
              
              <p className="text-muted mb-4" style={{fontSize: '0.875rem'}}>CGPA: {profile.cgpa || 'Not set'}</p>
              
              {!profile.cgpa && <button className="btn btn-primary w-100 fw-medium" onClick={handleEditProfile}>Complete profile</button>}
            </div>
          </div>

          {/* Applications Status */}
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <h5 className="fw-semibold mb-1 text-dark">Applications</h5>
              <p className="text-muted mb-4" style={{fontSize: '0.875rem'}}>Current placement progress</p>
              
              <div className="d-flex align-items-center gap-3">
                <div className="text-primary bg-primary-subtle rounded d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}>
                  <i className="bi bi-briefcase fs-5"></i>
                </div>
                <div>
                  <div className="fw-medium text-dark" style={{fontSize: '0.9rem'}}>{stats.activeApps} active applications</div>
                  <div className="text-muted" style={{fontSize: '0.8125rem'}}>{stats.interviews} interview scheduled</div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* MODALS */}
      
      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">Edit Profile</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditProfile(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={submitEditProfile}>
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-medium mb-1">Department</label>
                    <input type="text" className="form-control" value={editForm.department} onChange={e => setEditForm({...editForm, department: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-medium mb-1">Batch (e.g. 2026)</label>
                    <input type="text" className="form-control" value={editForm.batch} onChange={e => setEditForm({...editForm, batch: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-medium mb-1">Phone</label>
                    <input type="text" className="form-control" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-medium mb-1">CGPA</label>
                    <input type="number" step="0.01" className="form-control" value={editForm.cgpa} onChange={e => setEditForm({...editForm, cgpa: e.target.value})} />
                  </div>
                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <button type="button" className="btn btn-light" onClick={() => setShowEditProfile(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Skill Modal */}
      {showAddSkill && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">Add Skill</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddSkill(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={submitAddSkill}>
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-medium mb-1">Skill Name</label>
                    <input type="text" className="form-control" placeholder="e.g. React.js" required value={skillForm.name} onChange={e => setSkillForm({...skillForm, name: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-medium mb-1">Category (optional)</label>
                    <input type="text" className="form-control" placeholder="e.g. Frontend" value={skillForm.category} onChange={e => setSkillForm({...skillForm, category: e.target.value})} />
                  </div>
                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <button type="button" className="btn btn-light" onClick={() => setShowAddSkill(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Add Skill</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Certificate Modal */}
      {showAddCert && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">Add Certificate</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddCert(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={submitAddCert}>
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-medium mb-1">Certificate Name</label>
                    <input type="text" className="form-control" required value={certForm.name} onChange={e => setCertForm({...certForm, name: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-medium mb-1">Issue Date</label>
                    <input type="date" className="form-control" required value={certForm.issuedDate} onChange={e => setCertForm({...certForm, issuedDate: e.target.value})} />
                  </div>
                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <button type="button" className="btn btn-light" onClick={() => setShowAddCert(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Add Certificate</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
