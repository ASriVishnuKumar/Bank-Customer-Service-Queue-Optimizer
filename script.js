'use strict';

class QueueNode {
  constructor(tokenNumber, customerName) {
    this.tokenNumber = tokenNumber;
    this.customerName = customerName;
    this.status = 'Waiting';
    this.next = null;
  }
}

class LinkedQueue {
  constructor() {
    this.front = null;
    this.rear = null;
    this.length = 0;
  }

  enqueue(tokenNumber, customerName) {
    const node = new QueueNode(tokenNumber, customerName);
    if (this.rear === null) {
      this.front = node;
      this.rear = node;
    } else {
      this.rear.next = node;
      this.rear = node;
    }
    this.length += 1;
    return node;
  }

  dequeue() {
    if (this.front === null) return null;
    const servedNode = this.front;
    this.front = this.front.next;
    servedNode.next = null;
    this.length -= 1;
    if (this.front === null) this.rear = null;
    servedNode.status = 'Served';
    return servedNode;
  }

  toArray() {
    const nodes = [];
    let current = this.front;
    while (current !== null) {
      nodes.push(current);
      current = current.next;
    }
    return nodes;
  }

  clear() {
    let current = this.front;
    while (current !== null) {
      const next = current.next;
      current.next = null;
      current = next;
    }
    this.front = null;
    this.rear = null;
    this.length = 0;
  }
}

const queue = new LinkedQueue();
const servedHistory = [];
let nextTokenNumber = 101;
let tokensGenerated = 0;

const elements = {
  currentDate: document.getElementById('current-date'),
  generateForm: document.getElementById('generate-form'),
  customerName: document.getElementById('customer-name'),
  serveButton: document.getElementById('serve-button'),
  displayButton: document.getElementById('display-button'),
  resetButton: document.getElementById('reset-button'),
  queueFlow: document.getElementById('queue-flow'),
  tokenTableBody: document.getElementById('token-table-body'),
  tableEmpty: document.getElementById('table-empty'),
  queueCount: document.getElementById('queue-count'),
  tokensGenerated: document.getElementById('tokens-generated'),
  customersServed: document.getElementById('customers-served'),
  waitingCount: document.getElementById('waiting-count'),
  lastServed: document.getElementById('last-served'),
  lastServedCaption: document.getElementById('last-served-caption'),
  queueStatus: document.getElementById('queue-status'),
  queueStatusCaption: document.getElementById('queue-status-caption'),
  queueStatusDot: document.getElementById('queue-status-dot'),
  messageBox: document.getElementById('message-box'),
  messageIcon: document.getElementById('message-icon'),
  messageText: document.getElementById('message-text')
};

function showMessage(message, type = 'info') {
  elements.messageBox.classList.remove('is-success', 'is-error');
  if (type === 'success') elements.messageBox.classList.add('is-success');
  if (type === 'error') elements.messageBox.classList.add('is-error');
  elements.messageIcon.textContent = type === 'success' ? '✓' : type === 'error' ? '!' : 'i';
  elements.messageText.textContent = message;
}

function createTableCell(text) {
  const cell = document.createElement('td');
  cell.textContent = text;
  return cell;
}

function renderTable() {
  elements.tokenTableBody.replaceChildren();
  const records = [...servedHistory].reverse().concat(queue.toArray().reverse());
  for (const record of records) {
    const row = document.createElement('tr');
    row.append(createTableCell(String(record.tokenNumber)), createTableCell(record.customerName));
    const statusCell = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = `status-badge ${record.status === 'Served' ? 'status-served' : 'status-waiting'}`;
    badge.textContent = record.status;
    statusCell.append(badge);
    row.append(statusCell);
    elements.tokenTableBody.append(row);
  }
  elements.tableEmpty.hidden = records.length > 0;
}

function renderQueueFlow() {
  elements.queueFlow.replaceChildren();
  const customers = queue.toArray();
  if (customers.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'flow-empty';
    empty.textContent = 'No customers waiting.';
    elements.queueFlow.append(empty);
    return;
  }

  const frontLabel = document.createElement('span');
  frontLabel.className = 'queue-endpoint';
  frontLabel.textContent = 'FRONT';
  elements.queueFlow.append(frontLabel);

  for (const customer of customers) {
    const node = document.createElement('div');
    node.className = 'queue-node';
    const token = document.createElement('span');
    token.className = 'queue-node-token';
    token.textContent = String(customer.tokenNumber);
    const name = document.createElement('span');
    name.className = 'queue-node-name';
    name.textContent = customer.customerName;
    node.append(token, name);
    elements.queueFlow.append(node);
  }

  const rearLabel = document.createElement('span');
  rearLabel.className = 'queue-endpoint';
  rearLabel.textContent = 'REAR';
  elements.queueFlow.append(rearLabel);
}

function renderSummary() {
  const waiting = queue.length;
  elements.tokensGenerated.textContent = String(tokensGenerated);
  elements.customersServed.textContent = String(servedHistory.length);
  elements.waitingCount.textContent = String(waiting);
  elements.queueCount.textContent = `${waiting} waiting`;

  const last = servedHistory[servedHistory.length - 1];
  elements.lastServed.textContent = last ? last.customerName : '—';
  elements.lastServedCaption.textContent = last ? `Token ${last.tokenNumber}` : 'No customers served';

  elements.queueStatus.textContent = waiting > 0 ? 'In progress' : 'Open';
  elements.queueStatus.className = `status-badge ${waiting > 0 ? 'status-open' : 'status-idle'}`;
  elements.queueStatusCaption.textContent = waiting > 0 ? 'Customers are waiting' : 'Ready for customers';
  elements.queueStatusDot.classList.toggle('is-empty', waiting === 0);
}

function renderDashboard() {
  renderTable();
  renderQueueFlow();
  renderSummary();
}

function generateToken(customerName) {
  const cleanName = customerName.trim();
  if (!cleanName) {
    showMessage('Enter a customer name before generating a token.', 'error');
    elements.customerName.focus();
    return false;
  }

  const tokenNumber = nextTokenNumber;
  queue.enqueue(tokenNumber, cleanName);
  nextTokenNumber += 1;
  tokensGenerated += 1;
  renderDashboard();
  showMessage(`Token ${tokenNumber} generated for ${cleanName}.`, 'success');
  elements.customerName.value = '';
  elements.customerName.focus();
  return true;
}

elements.generateForm.addEventListener('submit', (event) => {
  event.preventDefault();
  generateToken(elements.customerName.value);
});

elements.serveButton.addEventListener('click', () => {
  const servedCustomer = queue.dequeue();
  if (servedCustomer === null) {
    renderDashboard();
    showMessage('No customers waiting.', 'error');
    return;
  }

  servedHistory.push(servedCustomer);
  renderDashboard();
  showMessage(`Now serving ${servedCustomer.customerName} (token ${servedCustomer.tokenNumber}).`, 'success');
});

elements.displayButton.addEventListener('click', () => {
  const customers = queue.toArray();
  renderDashboard();
  if (customers.length === 0) {
    showMessage('No customers waiting.', 'info');
    return;
  }
  showMessage(`Waiting list: ${customers.map((customer) => `${customer.tokenNumber} ${customer.customerName}`).join(' → ')}.`, 'info');
  elements.queueFlow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

elements.resetButton.addEventListener('click', () => {
  queue.clear();
  servedHistory.length = 0;
  nextTokenNumber = 101;
  tokensGenerated = 0;
  renderDashboard();
  showMessage('Queue reset. The next token will be 101.', 'success');
  elements.customerName.value = '';
});

elements.currentDate.textContent = new Intl.DateTimeFormat(undefined, {
  weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
}).format(new Date());

for (const [tokenNumber, customerName] of [[101, 'Arun'], [102, 'Priya'], [103, 'Karthik']]) {
  queue.enqueue(tokenNumber, customerName);
  tokensGenerated += 1;
  nextTokenNumber = tokenNumber + 1;
}

renderDashboard();