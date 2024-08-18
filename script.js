// script.js
const apiUrl = 'https://opentdb.com/api.php?amount=200&type=multiple'; // Update API URL to fetch 200 questions

let currentQuestionIndex = 0;
let questions = [];
let correctAnswers = 0;
let incorrectAnswers = 0;
let timerInterval; // Variable to hold the timer interval

// Display user's name
document.addEventListener('DOMContentLoaded', function() {
    const firstName = localStorage.getItem('firstName');
    const lastName = localStorage.getItem('lastName');
    if (firstName && lastName) {
        document.getElementById('user-name').textContent = `Welcome, ${firstName} ${lastName}!`;
    }
});

async function fetchQuestions() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        // Extract all questions from the response
        const allQuestions = data.results.map(question => ({
            question: question.question,
            options: [...question.incorrect_answers, question.correct_answer].sort(() => Math.random() - 0.5),
            correctAnswer: question.correct_answer
        }));

        // Randomly select 20 questions from all Questions
        const selectedQuestions = [];
        while (selectedQuestions.length < 20) {
            const randomIndex = Math.floor(Math.random() * allQuestions.length);
            selectedQuestions.push(allQuestions[randomIndex]);
            allQuestions.splice(randomIndex, 1); // Remove the selected question to avoid duplicates
        }

        // Decode HTML entities in questions and answers
        selectedQuestions.forEach(question => {
            question.question = decodeHtmlEntities(question.question);
            question.options = question.options.map(option => decodeHtmlEntities(option));
            question.correctAnswer = decodeHtmlEntities(question.correctAnswer);
        });

        questions = selectedQuestions;

        showQuestion();
    } catch (error) {
        console.error('Error fetching questions:', error);
    }
}

function decodeHtmlEntities(text) {
    const decoder = document.createElement('textarea');
    decoder.innerHTML = text;
    return decoder.value;
}

function showQuestion() {
    const questionElement = document.getElementById('question');
    const optionsElement = document.getElementById('options');
    const currentQuestion = questions[currentQuestionIndex];

    // Add fade-out animation before updating the question
    questionElement.classList.remove('fade-in');
    optionsElement.classList.remove('fade-in');

    setTimeout(() => {
        questionElement.textContent = currentQuestion.question;
        optionsElement.innerHTML = '';

        const questionNumberElement = document.getElementById('question-number');
        questionNumberElement.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;

        currentQuestion.options.forEach((option, index) => {
            const optionButton = document.createElement('button');
            optionButton.textContent = option;
            optionButton.classList.add('option-btn', 'slide-in');
            optionButton.addEventListener('click', () => checkAnswer(option, currentQuestion.correctAnswer, optionButton));
            optionsElement.appendChild(optionButton);
        });

        // Add fade-in animation after updating the question
        questionElement.classList.add('fade-in');
        optionsElement.classList.add('fade-in');
    }, 300); // Delay to allow fade-out animation to complete

    // Start the timer for 20 seconds
    startTimer(20);
}

function startTimer(duration) {
    let timer = duration;
    const timerElement = document.getElementById('timer');

    clearInterval(timerInterval); // Clear any existing timer interval

    timerInterval = setInterval(() => {
        timerElement.textContent = `Time Left: ${timer} seconds`;
        if (--timer < 0) {
            clearInterval(timerInterval);
            timerElement.textContent = `Time's Up!`;
            // Move to the next question or generate dashboard
            setTimeout(() => {
                currentQuestionIndex++;
                if (currentQuestionIndex < questions.length) {
                    showQuestion();
                } else {
                    generateDashboard();
                }
            }, 2000); // Wait for 2 seconds before moving to the next question
        }
    }, 1000);
}

function checkAnswer(selectedAnswer, correctAnswer, optionButton) {
    clearInterval(timerInterval); // Clear the timer interval when an answer is selected

    const options = document.querySelectorAll('.option-btn');
    options.forEach(option => {
        option.disabled = true; // Disable all options after selecting an answer
        if (option.textContent === correctAnswer) {
            option.style.backgroundColor = 'green'; // Change color to green for correct answer
        } else if (option.textContent === selectedAnswer) {
            option.style.backgroundColor = 'red'; // Change color to red for wrong answer
        }
    });

    if (selectedAnswer === correctAnswer) {
        optionButton.textContent += ' - Correct Answer!';
        optionButton.style.backgroundColor = 'green'; // Change color to green for selected correct answer
        correctAnswers++;
    } else {
        optionButton.textContent += ' - Wrong Answer!';
        optionButton.style.backgroundColor = 'red'; // Change color to red for selected wrong answer
        incorrectAnswers++;
    }

    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        // Show the next question after a pause of 1 seconds
        setTimeout(() => {
            showQuestion();
        }, 1000);
    } else {
        // Generate the dashboard after a pause of 1 seconds
        setTimeout(() => {
            generateDashboard();
        }, 1000);
    }
}

function generateDashboard() {
    const container = document.querySelector('.container');
    container.innerHTML = ''; // Clear existing content

    const dashboard = document.createElement('div');
    dashboard.classList.add('dashboard', 'fade-in'); // Add fade-in animation

    const totalQuestions = questions.length;
    const answeredQuestions = correctAnswers + incorrectAnswers;
    const skippedQuestions = totalQuestions - answeredQuestions;

    const correctPercentage = (correctAnswers / totalQuestions) * 100;
    const incorrectPercentage = (incorrectAnswers / totalQuestions) * 100;
    const skippedPercentage = (skippedQuestions / totalQuestions) * 100;

    const correctAnswerElement = document.createElement('p');
    correctAnswerElement.textContent = `Correct Answers: ${correctAnswers} (${correctPercentage.toFixed(2)}%)`;
    dashboard.appendChild(correctAnswerElement);

    const incorrectAnswerElement = document.createElement('p');
    incorrectAnswerElement.textContent = `Incorrect Answers: ${incorrectAnswers} (${incorrectPercentage.toFixed(2)}%)`;
    dashboard.appendChild(incorrectAnswerElement);

    const skippedAnswerElement = document.createElement('p');
    skippedAnswerElement.textContent = `Skipped Questions: ${skippedQuestions} (${skippedPercentage.toFixed(2)}%)`;
    dashboard.appendChild(skippedAnswerElement);

    // Calculate total score
    const totalScore = correctAnswers * 10;
    const totalScoreElement = document.createElement('p');
    totalScoreElement.textContent = `Total Score: ${totalScore}`;
    dashboard.appendChild(totalScoreElement);

    container.appendChild(dashboard);
}

document.getElementById('next-btn').addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        generateDashboard();
    }
});

document.getElementById('skip-btn').addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        generateDashboard();
    }
});

fetchQuestions();
