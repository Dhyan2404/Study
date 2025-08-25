import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { subject, customCode } = await request.json();

    if (!subject) {
      return Response.json({ 
        success: false, 
        error: 'Subject is required' 
      }, { status: 400 });
    }

    let code;
    if (customCode) {
      code = customCode.trim().toUpperCase();
      
      // Check if custom code already exists
      const existingCode = await sql`
        SELECT code FROM unlock_codes WHERE code = ${code}
      `;
      
      if (existingCode.length > 0) {
        return Response.json({ 
          success: false, 
          error: 'Code already exists' 
        }, { status: 400 });
      }
    } else {
      // Generate random code
      const prefix = subject === 'all' ? 'MASTER' : 
                   subject === 'Assignment Solution' ? 'ASSIGN' : 'MATH';
      const randomSuffix = Math.random().toString(36).substr(2, 6).toUpperCase();
      code = `${prefix}${randomSuffix}`;
    }

    await sql`
      INSERT INTO unlock_codes (code, subject)
      VALUES (${code}, ${subject})
    `;

    return Response.json({ 
      success: true, 
      code: code,
      message: 'Code generated successfully' 
    });

  } catch (error) {
    console.error('Error generating code:', error);
    return Response.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}