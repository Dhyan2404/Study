import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const result = await sql`
      SELECT subject, pdf_url FROM chapter_data
    `;

    const chapterData = {};
    result.forEach(row => {
      chapterData[row.subject] = row.pdf_url;
    });

    return Response.json(chapterData);

  } catch (error) {
    console.error('Error fetching chapter data:', error);
    return Response.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { subject, pdfUrl } = await request.json();

    if (!subject || !pdfUrl) {
      return Response.json({ 
        success: false, 
        error: 'Subject and PDF URL are required' 
      }, { status: 400 });
    }

    await sql`
      INSERT INTO chapter_data (subject, pdf_url, updated_at)
      VALUES (${subject}, ${pdfUrl}, CURRENT_TIMESTAMP)
      ON CONFLICT (subject) 
      DO UPDATE SET 
        pdf_url = ${pdfUrl},
        updated_at = CURRENT_TIMESTAMP
    `;

    return Response.json({ 
      success: true, 
      message: 'Chapter data updated successfully' 
    });

  } catch (error) {
    console.error('Error updating chapter data:', error);
    return Response.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}