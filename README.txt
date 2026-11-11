HARSH GOHEL PORTFOLIO
=====================

WHAT IS IN THIS FOLDER
  index.html          the portfolio page
  certificate.html    the page that shows one certificate (opens when a certificate is clicked)
  style.css           all colours and layout. One mocha background (#6F4E37) for the whole site,
                      with Platinum (#E5E4E2) and Lavender (#E6E0F0) text and highlights
  main.js             behaviour: opening screen, 3D globe, 3D medal, 3D skills orbit, tilt cards,
                      scroll-in effects, ribbon parallax, certificates, contact
  page.js             the left-to-right slide when you move between pages or sections
  certificates.js     the list of your certificates
  assets/             photo.webp (front of the medal), cartoon.webp (back of the medal),
                      ribbon-a.svg and ribbon-b.svg (the silver chrome ribbons)
  certificates/       each certificate as a PDF, a full picture and a small preview
  Harsh_Gohel_Resume.pdf   the file behind the Resume buttons

KEEP ALL OF THESE TOGETHER IN ONE FOLDER. Do not rename index.html.

PREVIEW ON YOUR COMPUTER
  Double-click index.html. You need internet for the fonts and for the message form.

PUBLISH (pick one)
  Netlify:       open app.netlify.com/drop and drag this whole folder onto the page.
  GitHub Pages:  create a repository, upload everything in this folder, then
                 Settings > Pages > Deploy from branch > main > Save.

AFTER PUBLISHING: ACTIVATE THE MESSAGE FORM (one time)
  Open your live site and send yourself a test message. FormSubmit emails
  harshgohel647@gmail.com once. Click "Activate form" in that email.
  After that, messages arrive in your inbox.

OPENING SCREEN
  The 3D emoji and "Harsh Gohel portfolio" show for a few seconds the first time the site is opened in a
  browser tab. Visitors can press Skip. To watch it again, add ?intro=1 to the address, or open the
  site in a new tab.

WHAT TO EDIT
  Background colours:   the first lines of style.css (the :root colours and the body::before gradient)
  Email or phone:       the CONTACT block at the top of main.js, and the Contact section of index.html
  Project code links:   the two "See my code on GitHub" buttons in index.html (they point to your GitHub profile)
  Add a certificate:    copy the PDF and two pictures into certificates/ with the same name,
                        then add one line to certificates.js
  Change the photo:     replace assets/photo.webp (square picture)
  Change the cartoon:   replace assets/cartoon.webp (transparent background, same proportions)
