// login.js
document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const password = document.getElementById('password').value;

    // Simple validation for demonstration purposes
    if (password === '1234') {
        // Save user name to local storage
        localStorage.setItem('firstName', firstName);
        localStorage.setItem('lastName', lastName);

        // Redirect to the quiz page
        window.location.href = 'quiz.html';
    } else {
        document.getElementById('login-error').textContent = 'Invalid username or password.';
    }
});
