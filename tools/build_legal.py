"""Generates BreakMath's legal pages. Edit the text here, then run from the repo root:

    python3 tools/build_legal.py .
"""
import sys, os

OUT = sys.argv[1]
EMAIL = 'kushshah1515@gmail.com'
DATE = 'November 16, 2026'
MAIL = f'<a href="mailto:{EMAIL}">{EMAIL}</a>'

TEMPLATE = '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} | BreakMath</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#05060A">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css?v=4">
</head>
<body>

<header class="nav">
  <div class="wrap nav-inner">
    <a class="brand" href="./" aria-label="BreakMath home">
      <svg class="brand-mark" viewBox="0 0 28 28" width="28" height="28" aria-hidden="true">
        <defs>
          <linearGradient id="foil" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#7DF3FF"/>
            <stop offset=".4" stop-color="#9B8CFF"/>
            <stop offset=".7" stop-color="#FF8AD4"/>
            <stop offset="1" stop-color="#FFD58A"/>
          </linearGradient>
        </defs>
        <rect x="3.5" y="6.5" width="13" height="18" rx="3" fill="none" stroke="url(#foil)" stroke-width="1.6" opacity=".55"/>
        <rect x="11.5" y="3.5" width="13" height="18" rx="3" fill="#05060A" stroke="url(#foil)" stroke-width="1.6"/>
        <path d="M15.5 14.5l2.5-5 2.5 5" fill="none" stroke="#F3F4F8" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>BreakMath</span>
    </a>
    <a class="btn btn-small" href="app.html">Open the planner</a>
  </div>
</header>

<main class="legal">
  <div class="wrap">
    <h1>{title}</h1>
    <p class="updated">Effective {date}</p>
{body}
  </div>
</main>

<footer class="footer">
  <div class="wrap footer-inner">
    <span>© 2026 BreakMath. Not affiliated with Whatnot.</span>
    <nav class="footer-links" aria-label="Legal">
{links}
    </nav>
  </div>
</footer>

<script>window.va = window.va || function () {{ (window.vaq = window.vaq || []).push(arguments); }};</script>
<script defer src="/_vercel/insights/script.js"></script>
<script src="config.js"></script>
<script src="analytics.js" defer></script>
</body>
</html>
'''

NAV = [('privacy.html', 'Privacy'), ('terms.html', 'Terms'), ('cookies.html', 'Cookies'), ('disclaimer.html', 'Disclaimer')]

PAGES = {}

PAGES['privacy.html'] = ('Privacy Policy', 'What BreakMath collects, why, and the choices you have.', f'''
<div class="summary">
<p><strong>The short version.</strong> When you create an account we store your email address and the breaks you save, so you can use them on any device. If you pay for Pro, Stripe handles the payment and we never see your card number. We count visits without cookies. We don't sell your information and we don't run advertising trackers.</p>
</div>

<h2>1. Who we are</h2>
<p>BreakMath ("BreakMath", "we", "us") offers a spot pricing and profit tracking tool for people who run card breaks. This policy covers this website and the BreakMath app. For privacy questions or requests, email {MAIL}.</p>

<h2>2. Information we collect</h2>
<h3>Information you give us</h3>
<ul>
<li><strong>Account details</strong>, when you create an account: your email address and a password. Passwords are stored in scrambled (hashed) form by our sign-in provider, Supabase; we cannot read them.</li>
<li><strong>Your breaks</strong>: everything you save in the app, including products, costs, fees, team lists, prices, results and profit history, is stored with your account.</li>
<li><strong>Email address</strong>, when you sign up for product updates or ask to hear when Pro goes on sale. We save it with the time you signed up and the ad campaign or website that sent you to us.</li>
<li><strong>Interest in Pro</strong>, when you click a "Get Pro" button before Pro is on sale. We record the click, the plan you chose, the time, the ad campaign or website that sent you to us and, if you are signed in, your account. We use this only to decide whether and when to offer Pro.</li>
<li><strong>Payment and subscription details</strong>, when you buy Pro. Stripe collects your name, email address, billing country and card details. We can see your name, email, plan, payment history and the last four digits and brand of your card in our Stripe account. We never receive or store your full card number.</li>
<li><strong>Anything you send us</strong>, when you email us, including your email address and the contents of your message.</li>
</ul>
<h3>Information collected automatically</h3>
<ul>
<li><strong>Visit statistics.</strong> We use Vercel Web Analytics, and may also use GoatCounter. Both are privacy-focused and do not use cookies. They record the page viewed, the referring site or campaign, browser and operating system, device type, and country or region. They do not build a profile of you across sites.</li>
<li><strong>Server logs.</strong> This site is hosted on Vercel, and accounts and saved breaks are held by Supabase. Both may log technical details of requests, including IP addresses, for security and to operate their services.</li>
<li><strong>Fonts.</strong> The site loads its typeface from Google Fonts, so your browser sends a request, including your IP address, to Google.</li>
</ul>
<h3>Information that stays on your device</h3>
<ul>
<li><strong>Unsaved work.</strong> The break you are still editing is kept in your browser's local storage until you save it, along with your sign-in session.</li>
<li><strong>If accounts are switched off.</strong> On a version of BreakMath without sign-in, everything you enter stays in your browser and is not sent to us.</li>
</ul>
<h3>Information we do not collect</h3>
<p>We do not collect precise location, government identifiers or sensitive personal information. We do not use advertising pixels or cross-site tracking.</p>

<h2>3. How we use information</h2>
<ul>
<li>To run your account, save your breaks and show them to you on any device.</li>
<li>To provide Pro, take payment through Stripe, and handle billing questions, cancellations and refunds.</li>
<li>To send a confirmation email when you sign up for updates, and occasional emails about new features, pricing and requests for feedback.</li>
<li>If you asked to hear when Pro goes on sale, to send you one email when it does.</li>
<li>To reply when you contact us.</li>
<li>To understand how many people visit, where they come from and whether they use the product, so we can improve it.</li>
<li>To keep the site secure and working, and to prevent abuse.</li>
<li>To comply with the law and enforce our <a href="terms.html">Terms of Service</a>.</li>
</ul>
<p>We do not use your information for automated decisions that have legal or similarly significant effects on you.</p>

<h2>4. Legal bases (European Economic Area, United Kingdom and Switzerland)</h2>
<p>Where those laws apply, we rely on: <strong>performance of a contract</strong> to run your account, provide the app and Pro, and take payment; your <strong>consent</strong> for update emails, which you can withdraw at any time; our <strong>legitimate interests</strong> in measuring and securing the site and answering messages; and <strong>legal obligations</strong> where the law requires us to keep or disclose information.</p>

<h2>5. How we share information</h2>
<p>We do not sell personal information, and we do not share it for cross-context behavioral advertising. We share it only as follows:</p>
<ul>
<li><strong>Service providers</strong> that help us run the site and act on our instructions: hosting and analytics (Vercel), accounts and database (Supabase), payments (Stripe), analytics (GoatCounter), fonts (Google), and Google (Google Sheets and Gmail), which we may use to store email sign-ups and send emails. Email sign-ups and Pro interest are stored in Supabase.</li>
<li><strong>Legal reasons</strong>, if we believe disclosure is required by law or legal process, or needed to protect the rights, property or safety of BreakMath, our users or others.</li>
<li><strong>Business changes</strong>, if BreakMath is reorganized, merged or sold. The recipient would have to honor this policy or tell you about any change.</li>
<li><strong>With your permission</strong>, in any other case.</li>
</ul>

<h2>6. How long we keep information</h2>
<ul>
<li><strong>Update emails list:</strong> until you unsubscribe or ask us to delete your address.</li>
<li><strong>Payment records:</strong> as long as you subscribe and afterwards for as long as tax and accounting rules require. Stripe keeps its own records under its privacy policy.</li>
<li><strong>Your account and saved breaks:</strong> until you delete them or ask us to delete your account. Email us and we will delete your account and everything saved in it.</li>
<li><strong>Messages you send us:</strong> as long as needed to handle your request and keep a record of it.</li>
<li><strong>Visit statistics:</strong> kept in aggregated form that does not identify you.</li>
</ul>

<h2>7. Your choices and rights</h2>
<ul>
<li><strong>Unsubscribe.</strong> Every email we send includes a way to unsubscribe, or you can email us and we will remove you.</li>
<li><strong>Access, correction and deletion.</strong> You can ask what information we hold about you, ask us to correct it, or ask us to delete it.</li>
<li><strong>Objection and restriction.</strong> You can object to, or ask us to limit, how we use your information.</li>
<li><strong>Portability.</strong> You can ask for a copy of your information in a common format.</li>
</ul>
<p>To make a request, email {MAIL}. We may need to confirm that the request comes from you. We will not treat you differently for using these rights, and we respond within the time the law requires.</p>
<h3>United States state privacy rights</h3>
<p>Residents of California and other states with privacy laws may have the right to know, access, correct and delete their personal information, and to opt out of its sale or sharing. We do not sell or share personal information as those laws define the terms. You may use an authorized agent to make a request, and you may appeal a decision by replying to our response.</p>
<h3>European Economic Area, United Kingdom and Switzerland</h3>
<p>You also have the right to withdraw consent at any time and to complain to your local data protection authority.</p>

<h2>8. Cookies and similar technology</h2>
<p>We do not set cookies. Details are in our <a href="cookies.html">Cookie Policy</a>.</p>

<h2>9. Do Not Track and Global Privacy Control</h2>
<p>Because we do not track you across sites or sell personal information, the site behaves the same way whether or not your browser sends a Do Not Track or Global Privacy Control signal.</p>

<h2>10. International visitors</h2>
<p>BreakMath is operated from the United States, and our service providers may process information in the United States and other countries. Privacy laws there may differ from the laws where you live. By using the site you understand that your information may be processed in those countries.</p>

<h2>11. Security</h2>
<p>We take reasonable steps to protect the information we hold, and we limit what we collect in the first place. No website or method of storage is completely secure, so we cannot guarantee absolute security.</p>

<h2>12. Children</h2>
<p>This site is intended for adults. It is not directed to children under 13, and we do not knowingly collect personal information from them. If you believe a child has given us personal information, email us and we will delete it.</p>

<h2>13. Links to other sites</h2>
<p>The site may link to websites we do not control. Their privacy practices are their own, and this policy does not cover them.</p>

<h2>14. Changes to this policy</h2>
<p>We may update this policy as the project changes, for example when we add features. We will post the new version here and change the effective date. If a change is significant, we will tell subscribers and people on our email list by email.</p>

<h2>15. Contact</h2>
<p>Email {MAIL} with any question about this policy or your information.</p>
''')

PAGES['terms.html'] = ('Terms of Service', 'The terms and conditions for using the BreakMath website, app and paid plans.', f'''
<div class="summary">
<p><strong>The short version.</strong> BreakMath does math on numbers you enter and gives estimates. You decide your own prices and run your own business, and BreakMath is not responsible for money you lose. You need a free account to use the app. Pro renews until you cancel, and you can cancel any time. These Terms of Service are also our terms and conditions of use.</p>
</div>

<h2>1. Agreement to these terms</h2>
<p>These Terms of Service ("Terms") are an agreement between you and BreakMath ("BreakMath", "we", "us"). They cover your use of this website, the BreakMath app, paid plans and our email list (together, the "Site"). By using the Site, you agree to these Terms, our <a href="privacy.html">Privacy Policy</a>, our <a href="cookies.html">Cookie Policy</a> and our <a href="disclaimer.html">Disclaimer</a>. If you do not agree, do not use the Site.</p>

<h2>2. Who can use the Site</h2>
<p>You must be at least 18 years old, or the age of legal majority where you live, to use the Site. By using the Site you confirm that you meet this requirement and that you can enter into a binding agreement.</p>

<h2>3. What the Site is</h2>
<p>BreakMath is a tool for pricing break spots and tracking profit. It is in early access: it is new, it may contain errors, and features may be added, changed or removed. The app runs in your web browser and needs an account.</p>
<h3>Accounts and your data</h3>
<p>You need an account to use the app. Keep your password private; you are responsible for what happens under your account. Give an email address that belongs to you, and tell us if you think someone else has used your account. Breaks, templates and results you save are stored with your account on our service providers' servers. We work to keep that data safe and available, but we do not guarantee it will never be lost, so <strong>keep your own copy of anything important</strong> using the backup and export options in the app. You can delete your data in the app, or email us to delete your account.</p>

<h2>4. Email updates</h2>
<ul>
<li>Signing up for email updates is free and optional.</li>
<li>You agree to give an email address that belongs to you.</li>
<li>We will email you about BreakMath. You can unsubscribe at any time.</li>
</ul>

<h2>5. The calculator, and no professional advice</h2>
<p>BreakMath does arithmetic on numbers you enter. Its results are estimates for general information only. They are not financial, business, investment, tax, accounting or legal advice, and they are not a recommendation to buy any product, charge any price or run any break.</p>
<ul>
<li>BreakMath does not know the value of any card, box, case, team or spot, and does not use market price data.</li>
<li>Results depend entirely on your inputs. Wrong or incomplete inputs give wrong results.</li>
<li>Results do not account for everything that affects your profit, including refunds, chargebacks, taxes, shipping problems, platform rule changes and changes in demand. Fill rates and fee rates are your estimates, and any fee rates the app suggests may be out of date.</li>
<li>Sample breaks, sample numbers and the sample profit history on the Site are illustrations. They are not real results and do not predict yours.</li>
</ul>

<h2>6. Your business is your responsibility</h2>
<p>You alone decide what to buy, what to charge and how to run your breaks. <strong>You are solely responsible for your pricing, your sales and your results, including any loss of money.</strong> You are also responsible for following the law and the rules that apply to you, including the terms of any platform you sell on, consumer protection, sweepstakes and gaming laws, sales tax and income tax. BreakMath does not guarantee that you will make a profit, break even or sell any spot. Using BreakMath does not make us your partner, agent, adviser or fiduciary.</p>

<h2>7. Plans, billing, cancellation and refunds</h2>
<ul>
<li><strong>Free plan.</strong> The free plan has limits, shown on the Site, which we may change.</li>
<li><strong>Pro.</strong> Pro is a subscription billed in advance, monthly or yearly, at the price shown when you subscribe. When paid plans are not yet on sale, the Site says so and Pro features may be available at no charge; that can end when paid plans start.</li>
<li><strong>Automatic renewal.</strong> Your subscription renews automatically at the end of each billing period, at the then-current price, until you cancel. You authorize us to charge your payment method through Stripe for each renewal.</li>
<li><strong>Cancelling.</strong> You can cancel at any time through the subscription management link in the app or on your Stripe receipt, or by emailing us. Cancelling stops future charges. You keep Pro until the end of the period you already paid for.</li>
<li><strong>Refunds.</strong> If you are not satisfied, email us within 7 days of your first payment and we will refund it in full. Apart from that, payments are not refundable and we do not give partial refunds for unused time, except where the law requires.</li>
<li><strong>Price changes.</strong> We may change prices. For existing subscribers a change takes effect at the next renewal, and we will give at least 30 days' notice by email so you can cancel first.</li>
<li><strong>Taxes.</strong> Prices do not include taxes unless stated. Any applicable tax is added at checkout.</li>
<li><strong>Payment processing.</strong> Payments are processed by Stripe under Stripe's own terms and privacy policy. We do not receive or store your full card details.</li>
<li><strong>How Pro works.</strong> Pro is attached to the account you were signed in to when you paid, and works on any device you sign in on. It can take a minute to switch on after payment. If it does not, email us.</li>
<li><strong>Failed payments.</strong> If a payment fails or is reversed, we may suspend or end Pro.</li>
</ul>

<h2>8. Acceptable use</h2>
<p>You agree not to:</p>
<ul>
<li>use the Site in any way that breaks the law or these Terms;</li>
<li>sign someone else up for emails, or submit false information;</li>
<li>unlock or use Pro without paying for it, or share access to a paid plan;</li>
<li>try to gain unauthorized access to the Site, its hosting or its data, or interfere with how it works;</li>
<li>use bots, scrapers or other automated means to access the Site in a way that burdens it or to submit forms;</li>
<li>introduce malware or other harmful code;</li>
<li>copy, resell or republish the Site or present it as your own, except as these Terms allow;</li>
<li>use the BreakMath name or branding in a way that suggests we endorse you without our written permission.</li>
</ul>

<h2>9. Intellectual property</h2>
<p>The Site and its content, including text, design, graphics, logos and code, belong to BreakMath or its licensors and are protected by law. We give you a limited, revocable, non-transferable permission to view the Site and use the calculator for your own break planning. All other rights are reserved.</p>

<h2>10. Feedback</h2>
<p>If you send us ideas or feedback, you agree that we may use them freely, without restriction and without paying you.</p>

<h2>11. Third parties and trademarks</h2>
<p>BreakMath is independent. It is not affiliated with, endorsed by or sponsored by Whatnot, any other selling platform, any sports league or team, or any card manufacturer. Names of those companies and products belong to their owners and are used only to describe how BreakMath may be used. City and team names in examples are used descriptively. Links to other websites are provided for convenience; we are not responsible for their content or practices.</p>

<h2>12. Copyright complaints</h2>
<p>If you believe something on the Site infringes your copyright, email {MAIL} with: a description of the work, where the material appears on the Site, your contact details, a statement that you believe in good faith the use is not authorized, a statement that your notice is accurate and, under penalty of perjury, that you are authorized to act for the owner, and your physical or electronic signature.</p>

<h2>13. No warranties</h2>
<p><strong>The Site, the calculator and everything on them are provided "as is" and "as available", without warranties of any kind, whether express, implied or statutory.</strong> To the fullest extent the law allows, BreakMath disclaims all warranties, including implied warranties of merchantability, fitness for a particular purpose, accuracy, title and non-infringement. We do not warrant that the Site will be available, secure or free of errors, that calculations will be accurate or complete, or that using BreakMath will produce any particular result or profit.</p>

<h2>14. Limitation of liability</h2>
<p><strong>To the fullest extent the law allows, BreakMath and its owners, operators, contractors and affiliates will not be liable for any indirect, incidental, special, consequential, exemplary or punitive damages, or for any loss of profits, revenue, sales, business, goodwill or data, arising out of or related to the Site, the app, paid plans or these Terms.</strong> This includes losses from prices you set, products you bought, breaks you ran, spots that did not sell, data lost from your browser, and decisions you made using information from the Site. It applies however the claim arises, whether in contract, tort (including negligence), strict liability or otherwise, and even if we were told the loss was possible.</p>
<p><strong>To the fullest extent the law allows, our total liability for all claims related to the Site or these Terms is limited to the greater of the amount you paid us in the 12 months before the claim, or US $50.</strong></p>
<p>Some places do not allow certain warranty disclaimers or liability limits, so parts of sections 13 and 14 may not apply to you. In that case they apply to the greatest extent the law permits. Nothing in these Terms limits liability that cannot be limited by law.</p>

<h2>15. Assumption of risk</h2>
<p>Buying sealed trading card products and selling break spots carries financial risk, including the risk of losing money. You understand and accept that risk, and you use the Site and its estimates at your own risk.</p>

<h2>16. Indemnification</h2>
<p>To the extent the law allows, you agree to defend, indemnify and hold harmless BreakMath and its owners, operators, contractors and affiliates from any claims, losses, liabilities and expenses, including reasonable legal fees, that arise from your use of the Site, your breaks or other business activities, your dealings with your buyers or any platform, or your violation of these Terms or the law.</p>

<h2>17. Ending or changing the Site</h2>
<p>We may change, suspend or shut down the Site or any part of it at any time, and we may block anyone who breaks these Terms. If we shut down Pro, we will refund the unused part of any period you have paid for. You may stop using the Site at any time. Sections that by their nature should continue, including sections 5, 6 and 9 through 20, survive.</p>

<h2>18. Governing law and disputes</h2>
<p>These Terms are governed by the laws of the United States and of the state in which the operator of BreakMath resides, without regard to conflict of law rules. Before starting any legal action, you agree to email {MAIL} and give us 30 days to try to resolve the issue informally. Any action that is not resolved must be brought in the state or federal courts located in that state, and you and BreakMath consent to those courts, unless the law where you live gives you the right to bring a claim in your local courts. To the extent the law allows, any claim must be brought within one year after it arises. If you are a consumer, nothing in these Terms removes protections that the law of your home country or state says cannot be waived.</p>

<h2>19. Changes to these Terms</h2>
<p>We may update these Terms. We will post the new version here and change the effective date, and we will tell subscribers by email if a change is significant. If you keep using the Site after a change takes effect, you accept the updated Terms.</p>

<h2>20. General</h2>
<ul>
<li><strong>Entire agreement.</strong> These Terms and the policies they refer to are the whole agreement between you and BreakMath about the Site.</li>
<li><strong>Severability.</strong> If a court finds part of these Terms unenforceable, the rest stays in effect.</li>
<li><strong>No waiver.</strong> If we do not enforce a part of these Terms, we have not given up the right to enforce it later.</li>
<li><strong>Assignment.</strong> You may not transfer your rights under these Terms. We may transfer ours, for example if BreakMath is reorganized or sold.</li>
<li><strong>No third-party rights.</strong> These Terms do not give rights to anyone other than you and BreakMath.</li>
<li><strong>Electronic communications.</strong> You agree that we may send you notices by email or by posting them on the Site.</li>
</ul>

<h2>21. Contact</h2>
<p>Questions about these Terms: {MAIL}.</p>
''')

PAGES['cookies.html'] = ('Cookie Policy', 'How BreakMath uses cookies and similar technology. Short answer: no cookies.', f'''
<div class="summary">
<p><strong>The short version.</strong> BreakMath does not set cookies, so there is no cookie banner to click through.</p>
</div>

<h2>1. Cookies</h2>
<p>Cookies are small files a website saves in your browser. This site does not set any, for advertising, analytics or anything else.</p>

<h2>2. Analytics without cookies</h2>
<p>We use Vercel Web Analytics, and may use GoatCounter, to count visits. Neither uses cookies or stores anything on your device, and neither follows you across other websites. What it records is described in our <a href="privacy.html">Privacy Policy</a>.</p>

<h2>3. Browser storage</h2>
<p>Browsers offer "local storage", which works like a cookie but is never sent to a server. The BreakMath app uses it to keep you signed in and to hold the break you are still editing. This is necessary for the app to work. Clearing it in your browser's site data settings signs you out; breaks you have saved to your account are not affected.</p>

<h2>4. Other services your browser contacts</h2>
<ul>
<li><strong>Vercel</strong> hosts the site, counts visits without cookies, and receives the technical details of each request, including your IP address.</li>
<li><strong>Supabase</strong> handles sign-in and stores your account, saved breaks, email sign-ups and Pro interest.</li>
<li><strong>Google Fonts</strong> delivers the typeface, so your browser sends a request, including your IP address, to Google.</li>
<li><strong>GoatCounter</strong> receives the visit information described above.</li>
<li><strong>Google</strong> may receive your email address if you sign up for updates, if we store sign-ups in Google Sheets.</li>
<li><strong>Stripe</strong> handles checkout on its own website when you buy Pro, and sets its own cookies there for security and fraud prevention.</li>
</ul>
<p>We do not use advertising pixels or social media trackers.</p>

<h2>5. Your controls</h2>
<p>You can block or delete cookies and site data in your browser settings, and you can use a content blocker to stop analytics. The site works the same either way.</p>

<h2>6. Changes</h2>
<p>If we start using cookies we will update this page first and ask for consent where the law requires it.</p>

<h2>7. Contact</h2>
<p>Questions: {MAIL}.</p>
''')

PAGES['disclaimer.html'] = ('Disclaimer', 'BreakMath gives estimates, not advice or guarantees. You are responsible for your own prices and results.', f'''
<div class="summary">
<p><strong>The short version.</strong> BreakMath does math on numbers you enter. It does not give advice and does not guarantee profit. Every pricing and buying decision is yours, and BreakMath is not responsible if you lose money.</p>
</div>

<h2>1. Estimates, not advice</h2>
<p>Everything on this site, including the calculator and its results, is general information. It is not financial, business, investment, tax, accounting or legal advice. Talk to a qualified professional about your own situation.</p>

<h2>2. No guarantee of profit</h2>
<p>BreakMath does not promise that you will make money, break even, hit a profit goal or sell any spot. A price the calculator shows is the price that would meet your goal if every assumption you entered holds and every spot sells at that price. Real breaks often go differently. Past results, sample results and planned results do not predict future results.</p>

<h2>3. Your decisions, your responsibility</h2>
<p><strong>You make every decision about what to buy, what to charge and how to run your breaks, and you are solely responsible for the outcome. To the fullest extent the law allows, BreakMath is not liable for any loss of money, profit, sales or business that results from using this site or relying on its numbers.</strong> The full terms are in sections 13 to 16 of our <a href="terms.html">Terms of Service</a>.</p>

<h2>4. The numbers are yours</h2>
<p>BreakMath does not know what any card, box, case, team or spot is worth and does not use market price data. Results depend entirely on the costs, fees, goals and team tiers you enter. Check your inputs, especially the fees your platform and payment processor actually charge.</p>

<h2>5. What the calculator leaves out</h2>
<p>Results use the fee rates and the share of spots you tell it you expect to sell. They assume unsold spots are spread evenly by value, which may not match your break. Any platform fee rates the app offers to fill in are commonly reported figures that may be out of date or not apply to you; check your own payout statement. Results do not include refunds, chargebacks, returned or lost shipments, taxes, fees charged on buyer-paid shipping and tax, your time, or changes in demand, unless you add them to your own numbers.</p>

<h2>6. Sample numbers</h2>
<p>The sample break, team list, prices and profit history shown on this site are made-up examples that show how the product is meant to work. They are not real customer results.</p>

<h2>7. Accuracy and errors</h2>
<p>We work to keep the math and the information on this site correct, but it is provided "as is" and may contain errors or be out of date. Prices are rounded, which can move results slightly away from your goal. Check any number that matters before you rely on it.</p>

<h2>8. Early access</h2>
<p>BreakMath is new and in early access. It may contain errors, and features, plans and prices may change. Keep your own backup of anything important.</p>

<h2>9. Following the rules</h2>
<p>You are responsible for following the law and the rules of any platform you sell on, including rules about breaks, giveaways, consumer protection and taxes. BreakMath does not review your breaks and does not confirm that they comply.</p>

<h2>10. No affiliation</h2>
<p>BreakMath is not affiliated with, endorsed by or sponsored by Whatnot, any other selling platform, any sports league or team, or any card manufacturer. Their names and trademarks belong to their owners. City and team names in examples are used descriptively.</p>

<h2>11. Other websites</h2>
<p>We are not responsible for the content or practices of websites we link to.</p>

<h2>12. Contact</h2>
<p>Questions: {MAIL}.</p>
''')

for fname, (title, desc, body) in PAGES.items():
    links = '\n'.join(
        f'      <a href="{h}"' + (' aria-current="page"' if h == fname else '') + f'>{t}</a>'
        for h, t in NAV)
    html = TEMPLATE.format(title=title, desc=desc, date=DATE, body=body.strip('\n'), links=links)
    with open(os.path.join(OUT, fname), 'w') as f:
        f.write(html)
    print('wrote', fname, len(html))
