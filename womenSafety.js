document.getElementById('sos-button').addEventListener('click', () => {
    document.getElementById('sos-status').innerText = "SOS Alert Sent!";
    // Simulate an SOS alert (you could integrate real SMS or API services here)
    console.log("SOS Alert sent to emergency contacts");
});

// Adding a contact to the trusted contacts list
document.getElementById('contact-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('contact-name').value;
    const phone = document.getElementById('contact-phone').value;

    if (name && phone) {
        const contactItem = document.createElement('li');
        contactItem.innerText = `${name}: ${phone}`;
        document.getElementById('contacts-list').appendChild(contactItem);

        // Clear input fields
        document.getElementById('contact-name').value = '';
        document.getElementById('contact-phone').value = '';
    }
});



const TWILIO_ACCOUNT_SID = "AC3d47d6c837a3d738bfb8e9e5efc835fe"; // Replace with your Twilio Account SID
const TWILIO_AUTH_TOKEN = "ydcd700823ec32e0e2bc8dd9b3600aeb0"; // Replace with your Twilio Auth Token
const TWILIO_PHONE_NUMBER = "+12315975874"; // Replace with your Twilio phone number
const SENDGRID_API_KEY = "S41HKd29XAd5mgLm3BEewBk2BEUDTzQI"; // Replace with your SendGrid API Key

// Emergency alert with Twilio and SendGrid
document.getElementById("dangerButton").addEventListener("dblclick", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            const locationLink = `https://maps.google.com/?q=${latitude},${longitude}`;
            const message = `Emergency alert! User is in danger. Live Location: ${locationLink}`;

            // Sending alerts
            userData.contacts.forEach(contact => {
                if (contact.includes("@")) {
                    sendEmail(contact, userData.name, userData.bloodGroup, locationLink, message);
                } else {
                    sendSMS(contact, message);
                }
            });

            alert("Emergency alert sent to contacts!");
        }, () => {
            alert("Unable to fetch location. Please enable location services.");
        });
    }
});

// Function to send SMS using Twilio API
function sendSMS(to, body) {
    fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
        method: "POST",
        headers: {
            "Authorization": "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            To: to,
            From: TWILIO_PHONE_NUMBER,
            Body: body
        })
    })
    .then(response => response.json())
    .then(data => console.log("SMS sent successfully:", data))
    .catch(error => console.error("Error sending SMS:", error));
}

// Function to send Email using SendGrid API
function sendEmail(to, name, bloodGroup, location, message) {
    fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${SENDGRID_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            personalizations: [{
                to: [{ email: to }],
                subject: "Emergency Alert - Women Protection App"
            }],
            from: { email: "your_email@example.com" }, // Replace with a verified sender email
            content: [{
                type: "text/plain",
                value: `
                    Emergency Alert!
                    
                    Name: ${name}
                    Blood Group: ${bloodGroup}
                    Location: ${location}
                    Message: ${message}
                `
            }]
        })
    })
    .then(response => response.json())
    .then(data => console.log("Email sent successfully:", data))
    .catch(error => console.error("Error sending email:", error));
}
document.getElementById('dangerButton').addEventListener('click', function() {
    getLocation((locationLink) => {
      alert(`Sending emergency alert with location: ${locationLink}`);
  
      // Send location data to the backend
      fetch('/send_alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locationLink: locationLink, // Send location link to the backend
        }),
      })
      .then(response => response.json())
      .then(data => {
        console.log('Alert sent successfully:', data);
      })
      .catch(error => {
        console.error('Error sending alert:', error);
      });
    });
  });
  
  function getLocation(callback) {
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
              (position) => {
                  const latitude = position.coords.latitude;
                  const longitude = position.coords.longitude;
                  const locationLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
                  callback(locationLink, latitude, longitude);
              },
              (error) => {
                  alert('Unable to fetch location. Please enable location services.');
                  console.error('Geolocation error:', error);
              }
          );
      } else {
          alert('Geolocation is not supported by your browser.');
      }
  }