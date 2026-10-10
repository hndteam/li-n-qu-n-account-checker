import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeHeroesData() {
  const url = 'https://cdn.jsdelivr.net/gh/MLuc24/lien-quan-data@main/data/heroes.json';
  const response = await axios.get(url, { timeout: 15000 });
  return { source: 'github:MLuc24/lien-quan-data', count: response.data.length, data: response.data };
}

export async function scrapeItemsData() {
  const url = 'https://cdn.jsdelivr.net/gh/MLuc24/lien-quan-data@main/data/items.json';
  const response = await axios.get(url, { timeout: 15000 });
  return { source: 'github:MLuc24/lien-quan-data', count: response.data.length, data: response.data };
}

export async function scrapeRunesData() {
  const url = 'https://cdn.jsdelivr.net/gh/MLuc24/lien-quan-data@main/data/runes.json';
  const response = await axios.get(url, { timeout: 15000 });
  return { source: 'github:MLuc24/lien-quan-data', count: response.data.length, data: response.data };
}

export async function scrapeLeaderboard() {
  const url = 'https://lienquan.garena.vn/giai-dau/bang-xep-hang/';
  const response = await axios.get(url, { timeout: 15000 });
  const $ = cheerio.load(response.data);
  const rows = [];

  $('table tbody tr').each((i, el) => {
    const cells = $(el).find('td');
    if (cells.length >= 4) {
      rows.push({
        rank: $(cells[0]).text().trim(),
        team: $(cells[1]).text().trim(),
        wins: $(cells[2]).text().trim(),
        losses: $(cells[3]).text().trim(),
        points: $(cells[4]).text().trim()
      });
    }
  });

  return { source: url, count: rows.length, data: rows };
}

export async function scrapePublicStatus(uid) {
  const url = 'https://xuphat.lienquan.garena.vn/';
  const payload = new URLSearchParams({ uid, action: 'search' });
  const response = await axios.post(url, payload.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 15000
  });
  const $ = cheerio.load(response.data);
  const text = $('body').text();

  return {
    uid,
    source: url,
    banned: /bị khóa|phạt|khóa/i.test(text),
    text: text.slice(0, 500),
    rawHtml: response.data.slice(0, 500)
  };
}
