document.addEventListener('DOMContentLoaded', () => {
    const inputField = document.getElementById('inputField');
    const resultArea = document.getElementById('resultArea');
    const resultValue = document.getElementById('resultValue');
    const resultExplanation = document.getElementById('resultExplanation');

    // Mode Switching
    const modeBtns = document.querySelectorAll('.mode-btn');
    const simpleMode = document.getElementById('simpleMode');
    const compoundMode = document.getElementById('compoundMode');
    const recipeMode = document.getElementById('recipeMode');
    let currentMode = 'simple';

    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;

            simpleMode.classList.remove('active');
            compoundMode.classList.remove('active');
            recipeMode.classList.remove('active');
            resultArea.classList.remove('visible');

            if (currentMode === 'simple') {
                simpleMode.classList.add('active');
            } else if (currentMode === 'compound') {
                compoundMode.classList.add('active');
            } else if (currentMode === 'recipe') {
                recipeMode.classList.add('active');
            }
        });
    });

    // Simple Mode Input
    inputField.addEventListener('input', (e) => {
        if (currentMode === 'simple') {
            const input = e.target.value;
            calculateSimple(input);
        }
    });

    // Compound Mode Calculation
    const calculateCompoundBtn = document.getElementById('calculateCompound');
    calculateCompoundBtn.addEventListener('click', calculateCompound);

    // Recipe Mode Logic
    const ingredientsList = document.getElementById('ingredientsList');
    const addIngredientBtn = document.getElementById('addIngredient');
    const calculateRecipeBtn = document.getElementById('calculateRecipe');

    addIngredientBtn.addEventListener('click', () => {
        const row = document.createElement('div');
        row.className = 'ingredient-row';
        row.innerHTML = `
            <input type="text" placeholder="Ингредиент" class="ingredient-name">
            <input type="number" placeholder="Граммы" class="ingredient-weight">
            <button class="remove-btn" onclick="this.parentElement.remove()">×</button>
        `;
        ingredientsList.appendChild(row);
    });

    calculateRecipeBtn.addEventListener('click', calculateRecipe);

    function calculateSimple(input) {
        // Regex to match "Number Operator Percentage%"
        // Supports spaces, decimals, and various operators
        const regex = /^(\d+(?:\.\d+)?)\s*([-+*/])\s*(\d+(?:\.\d+)?)%$/;
        const match = input.match(regex);

        if (match) {
            const base = parseFloat(match[1]);
            const operator = match[2];
            const percent = parseFloat(match[3]);

            let result;
            let explanation = '';
            const percentValue = (base * percent) / 100;

            switch (operator) {
                case '+':
                    result = base + percentValue;
                    explanation = `${percent}% от ${base} это ${formatNumber(percentValue)}. ${base} плюс ${formatNumber(percentValue)} равно ${formatNumber(result)}.`;
                    break;
                case '-':
                    result = base - percentValue;
                    explanation = `${percent}% от ${base} это ${formatNumber(percentValue)}. ${base} минус ${formatNumber(percentValue)} равно ${formatNumber(result)}.`;
                    break;
                case '*':
                    // For multiplication, usually X * Y% means X * (Y/100)
                    result = base * (percent / 100);
                    explanation = `${percent}% это ${percent / 100}. ${base} умножить на ${percent / 100} равно ${formatNumber(result)}.`;
                    break;
                case '/':
                    // For division, usually X / Y% means X / (Y/100)
                    if (percent === 0) {
                        showError("Деление на ноль невозможно");
                        return;
                    }
                    result = base / (percent / 100);
                    explanation = `${percent}% это ${percent / 100}. ${base} разделить на ${percent / 100} равно ${formatNumber(result)}.`;
                    break;
            }

            showResult(result, explanation);
        } else {
            if (input.trim() === '') {
                hideResult();
            } else {
                hideResult();
            }
        }
    }

    function calculateCompound() {
        const principal = parseFloat(document.getElementById('principal').value);
        const rate = parseFloat(document.getElementById('rate').value);
        const time = parseFloat(document.getElementById('time').value);

        if (isNaN(principal) || isNaN(rate) || isNaN(time)) {
            showError("Пожалуйста, заполните все поля корректными числами");
            return;
        }

        // Formula: A = P * (1 + r/100)^t
        const amount = principal * Math.pow((1 + rate / 100), time);
        const profit = amount - principal;

        const explanation = `
            Начальная сумма: ${formatNumber(principal)}<br>
            Процентная ставка: ${rate}%<br>
            Период: ${time}<br><br>
            Итоговая сумма: ${formatNumber(amount)}<br>
            Накопленный доход: ${formatNumber(profit)}
        `;

        showResult(amount, explanation, true);
    }

    function calculateRecipe() {
        const rows = document.querySelectorAll('.ingredient-row');
        const targetWeight = parseFloat(document.getElementById('targetWeight').value);

        if (isNaN(targetWeight) || targetWeight <= 0) {
            showError("Пожалуйста, введите корректную желаемую общую массу");
            return;
        }

        let totalWeight = 0;
        const ingredients = [];

        rows.forEach(row => {
            const name = row.querySelector('.ingredient-name').value || 'Ингредиент';
            const weight = parseFloat(row.querySelector('.ingredient-weight').value);

            if (!isNaN(weight)) {
                totalWeight += weight;
                ingredients.push({ name, weight });
            }
        });

        if (totalWeight === 0) {
            showError("Пожалуйста, добавьте хотя бы один ингредиент с весом");
            return;
        }

        let tableHtml = `
            <table class="recipe-result-table">
                <thead>
                    <tr>
                        <th>Ингредиент</th>
                        <th>%</th>
                        <th>Новый вес</th>
                    </tr>
                </thead>
                <tbody>
        `;

        ingredients.forEach(ing => {
            const percentage = (ing.weight / totalWeight) * 100;
            const newWeight = (percentage / 100) * targetWeight;

            tableHtml += `
                <tr>
                    <td>${ing.name}</td>
                    <td>${formatNumber(percentage)}%</td>
                    <td>${formatNumber(newWeight)} г</td>
                </tr>
            `;
        });

        tableHtml += `</tbody></table>`;

        const explanation = `
            Исходный вес: ${formatNumber(totalWeight)} г<br>
            Целевой вес: ${formatNumber(targetWeight)} г<br>
            Коэффициент: ${formatNumber(targetWeight / totalWeight)}
        `;

        showResult(targetWeight, explanation + tableHtml, true);
    }

    function formatNumber(num) {
        // Format to max 2 decimal places, remove trailing zeros
        return parseFloat(num.toFixed(2));
    }

    function showResult(value, explanation, isHTML = false) {
        resultValue.textContent = formatNumber(value);
        resultValue.classList.remove('error');

        if (isHTML) {
            resultExplanation.innerHTML = explanation;
        } else {
            resultExplanation.textContent = explanation;
        }

        resultArea.classList.add('visible');
    }

    function showError(message) {
        resultValue.textContent = "Ошибка";
        resultValue.classList.add('error');
        resultExplanation.textContent = message;
        resultArea.classList.add('visible');
    }

    function hideResult() {
        resultArea.classList.remove('visible');
    }
});
