import { loadRules, saveRules } from '../storage.js';

const rulesTable = document.getElementById('rules-input-table');

const state = {
    rules: [],
    ruleLines: []
};

main();

async function main() {
    const rules = await loadRules();
    state.rules = rules;
    state.ruleLines = rules.map(createRuleElement);
    state.ruleLines.forEach(tr => rulesTable.appendChild(tr));
}

document.getElementById('rules-add-button').addEventListener('click', () => {
    const newRule = {
        pk: '',
        rw: ''
    };
    const tr = createRuleElement(newRule);
    state.rules.push(newRule);
    state.ruleLines.push(tr);
    rulesTable.appendChild(tr);
});

function createRuleElement(rule) {
    const tr = document.createElement('tr');

    const projectKeyTd = document.createElement('td');
    const projectKeyInput = document.createElement('input');
    projectKeyInput.type = 'text';
    projectKeyInput.value = rule.pk;

    const replaceWithTd = document.createElement('td');
    const replaceWithInput = document.createElement('input');
    replaceWithInput.type = 'text';
    replaceWithInput.value = rule.rw;

    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'Delete';

    // Add event listeners
    projectKeyInput.addEventListener('blur', e => {
        rule.pk = e.target.value;
        saveRules(state.rules);
    });

    replaceWithInput.addEventListener('blur', e => {
        rule.rw = e.target.value;
        saveRules(state.rules);
    });

    deleteButton.addEventListener('click', () => {
        state.rules = state.rules.filter(r => r !== rule);
        state.ruleLines = state.ruleLines.filter(e => e !== tr);
        tr.remove();
        saveRules(state.rules);
    });

    // Append to the table
    projectKeyTd.appendChild(projectKeyInput);
    replaceWithTd.appendChild(replaceWithInput);
    tr.appendChild(projectKeyTd);
    tr.appendChild(replaceWithTd);
    tr.appendChild(deleteButton);

    return tr;
}
