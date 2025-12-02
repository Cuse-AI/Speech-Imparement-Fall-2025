const puppeteer = require('puppeteer');

async function run() {
  const BASE = process.env.BASE_URL || 'http://localhost:5173';
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  try {
    console.log('Visiting', BASE);
    await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 30000 });

    // Click Begin onboarding
    await page.waitForSelector('a[href="/onboarding"]', { timeout: 10000 });
    await page.click('a[href="/onboarding"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 });
    console.log('On onboarding page');

    // Fill form: set age and selects
    await page.waitForSelector('form', { timeout: 10000 });

    await page.evaluate(() => {
      const ageInput = document.querySelector('input[type=number]');
      if (ageInput) ageInput.value = 9;
      const selects = Array.from(document.querySelectorAll('select'));
      if (selects[0]) selects[0].value = 'beginner';
      if (selects[1]) selects[1].value = 'articulation';
    });

    // Submit form
    await Promise.all([
      page.click('button[type=submit]'),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 }),
    ]);

    console.log('Submitted onboarding, current URL:', page.url());

    // Check localStorage for userId
    const userId = await page.evaluate(() => localStorage.getItem('userId'));
    if (!userId) {
      throw new Error('userId not set in localStorage after onboarding');
    }

    console.log('Success: userId in localStorage =', userId);

    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('E2E test failed:', err && err.message ? err.message : err);
    await browser.close();
    process.exit(2);
  }
}

run();
