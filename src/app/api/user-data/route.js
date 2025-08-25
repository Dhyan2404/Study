import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const deviceId = url.searchParams.get("deviceId");

    if (!deviceId) {
      return Response.json(
        {
          success: false,
          error: "Device ID is required",
        },
        { status: 400 },
      );
    }

    const userResult = await sql`
      SELECT * FROM users WHERE device_id = ${deviceId}
    `;

    if (userResult.length === 0) {
      return Response.json({
        success: true,
        user: null,
      });
    }

    return Response.json({
      success: true,
      user: userResult[0],
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
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
    const { deviceId, name, studyTime, action } = await request.json();

    if (!deviceId) {
      return Response.json(
        {
          success: false,
          error: "Device ID is required",
        },
        { status: 400 },
      );
    }

    if (action === "updateActivity") {
      // Update user activity (login, study time, etc.)
      await sql`
        INSERT INTO users (device_id, name, last_login, login_count, session_count, last_activity, total_study_time, updated_at)
        VALUES (${deviceId}, ${name || ""}, CURRENT_TIMESTAMP, 1, 1, CURRENT_TIMESTAMP, ${studyTime || 0}, CURRENT_TIMESTAMP)
        ON CONFLICT (device_id) 
        DO UPDATE SET 
          name = COALESCE(${name}, users.name),
          last_login = CURRENT_TIMESTAMP,
          login_count = COALESCE(users.login_count, 0) + 1,
          session_count = COALESCE(users.session_count, 0) + 1,
          last_activity = CURRENT_TIMESTAMP,
          total_study_time = GREATEST(COALESCE(users.total_study_time, 0), ${studyTime || 0}),
          updated_at = CURRENT_TIMESTAMP
      `;
    } else {
      // Regular name update
      if (!name) {
        return Response.json(
          {
            success: false,
            error: "Name is required",
          },
          { status: 400 },
        );
      }

      await sql`
        INSERT INTO users (device_id, name, last_login, login_count, session_count, last_activity, unlocked_subjects, updated_at)
        VALUES (${deviceId}, ${name.trim()}, CURRENT_TIMESTAMP, 1, 1, CURRENT_TIMESTAMP, '{}', CURRENT_TIMESTAMP)
        ON CONFLICT (device_id) 
        DO UPDATE SET 
          name = ${name.trim()},
          last_login = CURRENT_TIMESTAMP,
          login_count = COALESCE(users.login_count, 0) + 1,
          session_count = COALESCE(users.session_count, 0) + 1,
          last_activity = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      `;
    }

    return Response.json({
      success: true,
      message: "User data saved successfully",
    });
  } catch (error) {
    console.error("Error saving user data:", error);
    return Response.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const { deviceId, studyTime } = await request.json();

    if (!deviceId) {
      return Response.json(
        {
          success: false,
          error: "Device ID is required",
        },
        { status: 400 },
      );
    }

    // Update study time periodically
    await sql`
      UPDATE users 
      SET total_study_time = ${studyTime || 0},
          last_activity = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE device_id = ${deviceId}
    `;

    return Response.json({
      success: true,
      message: "Study time updated successfully",
    });
  } catch (error) {
    console.error("Error updating study time:", error);
    return Response.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
