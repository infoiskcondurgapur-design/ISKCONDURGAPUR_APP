async function main() {
  const url = 'https://www.iskcondurgapur.org/admin/login';
  try {
    console.log(`Fetching ${url} headers...`);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    console.log(`Status Code: ${response.status}`);
    console.log('Headers:');
    for (const [key, value] of response.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
  } catch (error) {
    console.error('Error occurred:', error);
  }
}

main();
