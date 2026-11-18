const API_URL = ''; // Proxied via Vite

// Helper function to append JWT token to requests
const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    // Token expired or invalid — clear session and redirect to login
    localStorage.removeItem('token');
    window.location.href = '/login';
    return response;
  }

  return response;
};

// --- Auth APIs ---
export const loginUser = async (credentials) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to login');
  }
  return response.json();
};

export const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to register');
  }
  return response.text();
};

// --- Student APIs ---
export const fetchStudents = async () => {
  const response = await authFetch(`${API_URL}/students`);
  if (!response.ok) throw new Error('Failed to fetch students');
  return response.json();
};

export const fetchStudentById = async (id) => {
  const response = await authFetch(`${API_URL}/students/${id}`);
  if (!response.ok) throw new Error('Failed to fetch student');
  return response.json();
};

export const createStudent = async (student) => {
  const response = await authFetch(`${API_URL}/students`, {
    method: 'POST',
    body: JSON.stringify(student),
  });
  if (!response.ok) throw new Error('Failed to create student');
  return response.json();
};

export const updateStudent = async (id, student) => {
  const response = await authFetch(`${API_URL}/students/${id}`, {
    method: 'PUT',
    body: JSON.stringify(student),
  });
  if (!response.ok) throw new Error('Failed to update student');
  return response.json();
};

export const deleteStudent = async (id) => {
  const response = await authFetch(`${API_URL}/students/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete student');
};

// --- Company APIs ---
export const fetchCompanies = async () => {
  const response = await authFetch(`${API_URL}/companies`);
  if (!response.ok) throw new Error('Failed to fetch companies');
  return response.json();
};

export const fetchCompanyById = async (id) => {
  const response = await authFetch(`${API_URL}/companies/${id}`);
  if (!response.ok) throw new Error('Failed to fetch company');
  return response.json();
};

export const createCompany = async (company) => {
  const response = await authFetch(`${API_URL}/companies`, {
    method: 'POST',
    body: JSON.stringify(company),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to create company');
  }
  return response.json();
};

export const updateCompany = async (id, company) => {
  const response = await authFetch(`${API_URL}/companies/${id}`, {
    method: 'PUT',
    body: JSON.stringify(company),
  });
  if (!response.ok) throw new Error('Failed to update company');
  return response.json();
};

export const deleteCompany = async (id) => {
  const response = await authFetch(`${API_URL}/companies/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete company');
};

// --- Job Posting APIs ---
export const fetchJobPostings = async () => {
  const response = await authFetch(`${API_URL}/job-postings`);
  if (!response.ok) throw new Error('Failed to fetch job postings');
  return response.json();
};

export const fetchJobPostingById = async (id) => {
  const response = await authFetch(`${API_URL}/job-postings/${id}`);
  if (!response.ok) throw new Error('Failed to fetch job posting');
  return response.json();
};

export const createJobPosting = async (jobPosting) => {
  const response = await authFetch(`${API_URL}/job-postings`, {
    method: 'POST',
    body: JSON.stringify(jobPosting),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to create job posting');
  }
  return response.json();
};

export const updateJobPosting = async (id, jobPosting) => {
  const response = await authFetch(`${API_URL}/job-postings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(jobPosting),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to update job posting');
  }
  return response.json();
};

export const deleteJobPosting = async (id) => {
  const response = await authFetch(`${API_URL}/job-postings/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete job posting');
};

// --- Additional Student Features ---
export const fetchUserByUsername = async (username) => {
  const response = await authFetch(`${API_URL}/users/by-username/${username}`);
  if (!response.ok) throw new Error('Failed to fetch user');
  return response.json();
};

export const fetchStudentProfiles = async () => {
  const response = await authFetch(`${API_URL}/student-profiles`);
  if (!response.ok) return [];
  return response.json();
};

export const fetchStudentProfileById = async (id) => {
  const response = await authFetch(`${API_URL}/student-profiles/${id}`);
  if (!response.ok) throw new Error('Failed to fetch student profile');
  return response.json();
};

export const fetchStudentProfileByStudentId = async (studentId) => {
  const response = await authFetch(`${API_URL}/student-profiles/by-student/${studentId}`);
  if (!response.ok) throw new Error('Failed to fetch student profile');
  return response.json();
};

export const createStudentProfile = async (profileData) => {
  const response = await authFetch(`${API_URL}/student-profiles`, {
    method: 'POST',
    body: JSON.stringify(profileData),
  });
  if (!response.ok) throw new Error('Failed to create profile');
  return response.json();
};


export const fetchJobApplications = async () => {
  const response = await authFetch(`${API_URL}/job-applications`);
  if (!response.ok) return [];
  return response.json();
};

export const fetchJobApplicationsByStudentId = async (studentId) => {
  const response = await authFetch(`${API_URL}/job-applications/by-student/${studentId}`);
  if (!response.ok) return [];
  return response.json();
};

export const createJobApplication = async (application) => {
  const response = await authFetch(`${API_URL}/job-applications`, {
    method: 'POST',
    body: JSON.stringify(application),
  });
  if (!response.ok) throw new Error('Failed to submit application');
  return response.json();
};

export const fetchInterviews = async () => {
  const response = await authFetch(`${API_URL}/interview-schedules`);
  if (!response.ok) return [];
  return response.json();
};

export const updateStudentProfile = async (id, profileData) => {
  const response = await authFetch(`${API_URL}/student-profiles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
  if (!response.ok) throw new Error('Failed to update profile');
  return response.json();
};

//export const createSkill = async (skillData) => {
//  const response = await authFetch(`${API_URL}/skills`, {
//    method: 'POST',
//    body: JSON.stringify(skillData),
//  });
//  if (!response.ok) throw new Error('Failed to add skill');
//  return response.json();
//};
export const createSkill = async (skillData) => {
  const response = await authFetch(`${API_URL}/skills`, {
    method: 'POST',
    body: JSON.stringify(skillData),
  });

  if (!response.ok) {
    const message = await response.text();
    console.error('Create skill failed:', response.status, message);

    throw new Error(
      `Failed to add skill (${response.status}): ${message}`
    );
  }

  return response.json();
};

export const createCertificate = async (certData) => {
  const response = await authFetch(`${API_URL}/certificates`, {
    method: 'POST',
    body: JSON.stringify(certData),
  });
  if (!response.ok) throw new Error('Failed to add certificate');
  return response.json();
};

export const fetchMyCertificates = async () => {
  const response = await authFetch(`${API_URL}/certificates/my`);
  if (!response.ok) return [];
  return response.json();
};

export const deleteCertificate = async (id) => {
  const response = await authFetch(`${API_URL}/certificates/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete certificate');
};

// --- Job Application Status Update ---
export const updateJobApplication = async (id, applicationData) => {
  const response = await authFetch(`${API_URL}/job-applications/${id}`, {
    method: 'PUT',
    body: JSON.stringify(applicationData),
  });
  if (!response.ok) throw new Error('Failed to update application');
  return response.json();
};

export const deleteJobApplication = async (id) => {
  const response = await authFetch(`${API_URL}/job-applications/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete application');
};

// --- Interview Schedule APIs ---
export const createInterviewSchedule = async (data) => {
  const response = await authFetch(`${API_URL}/interview-schedules`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create interview schedule');
  return response.json();
};

export const updateInterviewSchedule = async (id, data) => {
  const response = await authFetch(`${API_URL}/interview-schedules/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update interview schedule');
  return response.json();
};

export const deleteInterviewSchedule = async (id) => {
  const response = await authFetch(`${API_URL}/interview-schedules/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete interview schedule');
};

// --- Placement APIs ---
export const fetchPlacements = async () => {
  const response = await authFetch(`${API_URL}/placements`);
  if (!response.ok) return [];
  return response.json();
};

export const createPlacement = async (data) => {
  const response = await authFetch(`${API_URL}/placements`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create placement record');
  return response.json();
};

export const updatePlacement = async (id, data) => {
  const response = await authFetch(`${API_URL}/placements/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update placement record');
  return response.json();
};

export const deletePlacement = async (id) => {
  const response = await authFetch(`${API_URL}/placements/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete placement record');
};

// --- College APIs ---
export const fetchColleges = async () => {
  const response = await authFetch(`${API_URL}/colleges`);
  if (!response.ok) throw new Error('Failed to fetch colleges');
  return response.json();
};

export const createCollege = async (data) => {
  const response = await authFetch(`${API_URL}/colleges`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create college');
  return response.json();
};

export const updateCollege = async (id, data) => {
  const response = await authFetch(`${API_URL}/colleges/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update college');
  return response.json();
};

export const deleteCollege = async (id) => {
  const response = await authFetch(`${API_URL}/colleges/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete college');
};

// --- User APIs ---
export const fetchUsers = async () => {
  const response = await authFetch(`${API_URL}/users`);
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};

export const deleteUser = async (id) => {
  const response = await authFetch(`${API_URL}/users/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete user');
};

/**
 * Auto-links a Student record to the currently authenticated StudentUser.
 * Needed for accounts created before the auto-link fix was deployed.
 */
// ── Placement Intelligence APIs ──────────────────────────────────────────────

export const fetchEligibility = async (jobId, studentId) => {
  const response = await authFetch(`${API_URL}/job-postings/${jobId}/eligibility/${studentId}`);
  if (!response.ok) throw new Error('Failed to fetch eligibility');
  return response.json();
};

export const fetchSkillGap = async (jobId, studentId) => {
  const response = await authFetch(`${API_URL}/job-postings/${jobId}/skill-gap/${studentId}`);
  if (!response.ok) throw new Error('Failed to fetch skill gap');
  return response.json();
};

export const fetchMatchResult = async (jobId, studentId) => {
  const response = await authFetch(`${API_URL}/job-postings/${jobId}/match/${studentId}`);
  if (!response.ok) throw new Error('Failed to fetch match result');
  return response.json();
};

export const fetchRecommendedJobs = async (studentId) => {
  const response = await authFetch(`${API_URL}/job-postings/recommended/${studentId}`);
  if (!response.ok) throw new Error('Failed to fetch recommended jobs');
  return response.json();
};
export const linkStudentProfile = async () => {
  const response = await authFetch(`${API_URL}/auth/link-student`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to link student profile');
  }

  return response.json();
};