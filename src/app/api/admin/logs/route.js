import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type"); // 'codes' or 'users'

    if (type === "codes") {
      const codes = await sql`
        SELECT 
          uc.id,
          uc.code,
          uc.subject,
          uc.is_used,
          uc.used_by_device_id,
          uc.used_timestamp,
          uc.created_at,
          u.name as used_by_name
        FROM unlock_codes uc
        LEFT JOIN users u ON uc.used_by_device_id = u.device_id
        ORDER BY uc.created_at DESC
      `;

      return Response.json({
        success: true,
        codes,
      });
    } else if (type === "users") {
      const users = await sql`
        SELECT 
          device_id,
          name,
          unlocked_subjects,
          created_at,
          updated_at,
          last_login,
          login_count,
          session_count,
          total_study_time,
          last_activity
        FROM users 
        ORDER BY last_activity DESC NULLS LAST, created_at DESC
      `;

      return Response.json({
        success: true,
        users,
      });
    } else {
      return Response.json(
        {
          success: false,
          error: 'Invalid type parameter. Use "codes" or "users"',
        },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Error fetching logs:", error);
    return Response.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    const { type, id, deviceId } = await request.json();

    if (type === "code") {
      if (!id) {
        return Response.json(
          {
            success: false,
            error: "Code ID is required",
          },
          { status: 400 },
        );
      }

      await sql`
        DELETE FROM unlock_codes WHERE id = ${id}
      `;

      return Response.json({
        success: true,
        message: "Code deleted successfully",
      });
    } else if (type === "user") {
      if (!deviceId) {
        return Response.json(
          {
            success: false,
            error: "Device ID is required",
          },
          { status: 400 },
        );
      }

      await sql`
        DELETE FROM users WHERE device_id = ${deviceId}
      `;

      return Response.json({
        success: true,
        message: "User access revoked successfully",
      });
    } else {
      return Response.json(
        {
          success: false,
          error: "Invalid type parameter",
        },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Error deleting record:", error);
    return Response.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const { action, deviceId, userName, subject } = await request.json();

    if (action === "grantAccess") {
      if (!deviceId || !subject) {
        return Response.json(
          {
            success: false,
            error: "Device ID and subject are required",
          },
          { status: 400 },
        );
      }

      // Get current user data
      let userResult = await sql`
        SELECT * FROM users WHERE device_id = ${deviceId}
      `;

      let currentUnlockedSubjects = [];
      if (userResult.length > 0) {
        currentUnlockedSubjects = userResult[0].unlocked_subjects || [];
      }

      // Add new subject to unlocked list
      const subjectsToAdd =
        subject === "all" ? ["Assignment Solution", "Maths Basic"] : [subject];
      const updatedSubjects = [
        ...new Set([...currentUnlockedSubjects, ...subjectsToAdd]),
      ];

      // Update or create user record
      await sql`
        INSERT INTO users (device_id, name, unlocked_subjects, updated_at)
        VALUES (${deviceId}, ${userName || ""}, ${updatedSubjects}, CURRENT_TIMESTAMP)
        ON CONFLICT (device_id) 
        DO UPDATE SET 
          name = COALESCE(${userName}, users.name),
          unlocked_subjects = ${updatedSubjects},
          updated_at = CURRENT_TIMESTAMP
      `;

      return Response.json({
        success: true,
        message: "Access granted successfully",
        unlockedSubjects: updatedSubjects,
      });
    }

    return Response.json(
      {
        success: false,
        error: "Invalid action",
      },
      { status: 400 },
    );
  } catch (error) {
    console.error("Error in grant access:", error);
    return Response.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
