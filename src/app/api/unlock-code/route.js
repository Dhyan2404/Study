import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { code, deviceId, subject, userName } = await request.json();

    if (!code || !deviceId) {
      return Response.json(
        {
          success: false,
          error: "Code and device ID are required",
        },
        { status: 400 },
      );
    }

    // Check if code exists and is not used
    const codeResult = await sql`
      SELECT * FROM unlock_codes 
      WHERE code = ${code} AND is_used = false
    `;

    if (codeResult.length === 0) {
      return Response.json(
        {
          success: false,
          error: "Invalid or already used code",
        },
        { status: 400 },
      );
    }

    const unlockCode = codeResult[0];

    // Determine which subjects to unlock
    let subjectsToUnlock = [];
    if (unlockCode.subject === "all") {
      subjectsToUnlock = ["Assignment Solution", "Maths Basic"];
    } else {
      subjectsToUnlock = [unlockCode.subject];
    }

    // Get current user data or create new user
    let userResult = await sql`
      SELECT * FROM users WHERE device_id = ${deviceId}
    `;

    let currentUnlockedSubjects = [];
    if (userResult.length > 0) {
      currentUnlockedSubjects = userResult[0].unlocked_subjects || [];
    }

    // Add new subjects to unlocked list
    const updatedSubjects = [
      ...new Set([...currentUnlockedSubjects, ...subjectsToUnlock]),
    ];

    // Update or create user record and mark code as used in a transaction
    await sql.transaction([
      sql`
        INSERT INTO users (device_id, name, unlocked_subjects, updated_at)
        VALUES (${deviceId}, ${userName || ""}, ${updatedSubjects}, CURRENT_TIMESTAMP)
        ON CONFLICT (device_id) 
        DO UPDATE SET 
          name = COALESCE(${userName}, users.name),
          unlocked_subjects = ${updatedSubjects},
          updated_at = CURRENT_TIMESTAMP
      `,
      sql`
        UPDATE unlock_codes 
        SET is_used = true, 
            used_by_device_id = ${deviceId}, 
            used_timestamp = CURRENT_TIMESTAMP
        WHERE code = ${code}
      `,
    ]);

    return Response.json({
      success: true,
      unlockedSubjects: subjectsToUnlock,
      allUnlockedSubjects: updatedSubjects,
    });
  } catch (error) {
    console.error("Error processing unlock code:", error);
    return Response.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}

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
      SELECT unlocked_subjects FROM users WHERE device_id = ${deviceId}
    `;

    const unlockedSubjects =
      userResult.length > 0 ? userResult[0].unlocked_subjects || [] : [];

    return Response.json({
      success: true,
      unlockedSubjects,
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
