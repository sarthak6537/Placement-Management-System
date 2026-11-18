import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class MigrationHelper {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/placementdb";
        String user = "placement_user";
        String password = "Akasha@123";

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {

            System.out.println("Applying security migrations...");

            try {
                stmt.execute("ALTER TABLE app_user ADD COLUMN role VARCHAR(50)");
                System.out.println("Added role column.");
            } catch (Exception e) {
                System.out.println("Role column might already exist: " + e.getMessage());
            }

            stmt.execute("UPDATE app_user SET role = 'ROLE_ADMIN' WHERE user_type = 'ADMIN'");
            stmt.execute("UPDATE app_user SET role = 'ROLE_PLACEMENT_OFFICER' WHERE user_type = 'PLACEMENT_OFFICER'");
            stmt.execute("UPDATE app_user SET role = 'ROLE_STUDENT' WHERE user_type = 'STUDENT'");
            stmt.execute("UPDATE app_user SET role = 'ROLE_STUDENT' WHERE role IS NULL");
            
            try {
                stmt.execute("ALTER TABLE app_user ALTER COLUMN role SET NOT NULL");
            } catch (Exception e) {}

            try {
                stmt.execute("ALTER TABLE app_user ADD COLUMN department VARCHAR(255)");
                System.out.println("Added department column.");
            } catch (Exception e) {}
            
            try {
                stmt.execute("ALTER TABLE app_user ADD COLUMN student_profile_id BIGINT");
                System.out.println("Added student_profile_id column.");
            } catch (Exception e) {}

            System.out.println("Migrations applied successfully!");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
