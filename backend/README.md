# Waitlist backend (Google Sheet)

Stores every signup in a Google Sheet and sends one thank-you email from your Gmail. Free. About ten minutes to set up.

## Set up

1. Go to [sheets.new](https://sheets.new) and name the sheet `BreakMath waitlist`.
2. In the sheet menu: **Extensions → Apps Script**.
3. Delete the code that is there, paste in everything from `waitlist.gs`, and save.
4. Click **Deploy → New deployment**. Click the gear next to "Select type" and choose **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy**, then **Authorize access**, and approve. Google shows an "unverified app" warning because you wrote the script yourself: click **Advanced → Go to (project name)**.
6. Copy the **Web app URL** (ends in `/exec`).
7. Paste it into `config.js` in this repo as `waitlistEndpoint`, then commit and push.

## Check it works

Join the waitlist on the site with your own email. A row should appear in the `Signups` tab and a thank-you email should arrive within a minute.

## Using it

- **How many signups:** cell F1 of the `Signups` tab.
- **Where they came from:** the Source column (`tiktok`, a referring site, or `direct`). Put `?utm_source=tiktok` on the end of the link in your ad.
- **Unsubscribes:** when someone replies "unsubscribe", delete their row.
- **Changing the script:** after editing, use **Deploy → Manage deployments → Edit → Version: New version** so the same URL keeps working.

## Limits

- A free Gmail account can send about 100 emails a day. The script stops sending thank-yous at 80 a day; signups are still saved.
- Thank-you emails come from the Google account that owns the sheet, so that address is visible to everyone who signs up.
