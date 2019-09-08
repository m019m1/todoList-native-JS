let taskList = document.getElementById('taskList');
let newTask = document.getElementById('newTask');
let taskListHeader = document.getElementById('taskListHeader');
class Task {
	constructor (text, made = false) {
		this._task = document.createElement('li');
		this._task.className = 'task';
		taskList.append(this._task);
	
		this._done = document.createElement('input');
		this._done.className = 'done';
		this._done.type = 'checkbox';
		this._task.append(this._done);
		
		this._close = document.createElement('button');
		this._close.className = 'close hidden';
		this._close.innerHTML = 'x';
		this._task.append(this._close);
	

		this._textOfTask = document.createElement('p');
		this._textOfTask.className = 'textOfTask';
		this._textOfTask.innerHTML = text;
		this._task.append(this._textOfTask);
	
		this._made = made;
		this._running =  true;
		this.run();
	}

	run() {
		if(this._made) {
			this._task.classList.add('made');
			this._done.setAttribute('checked', 'checked');
			this._close.classList.toggle('hidden');
		}

		this._done.onclick = () => {
			this._task.classList.toggle('made');
			this._close.classList.toggle('hidden');
			this._made ? this._made = false : this._made = true;
			showCount();
		};

		this._close.onclick = () => {
			this._task.remove();
			this._running = false;
			tasks = tasks.filter( task => {
				return task._running;
			});
		};

		this._task.ondblclick = (e) => {
			if(e.target.classList.contains('done')) return;
			let edit = document.createElement('textarea');
			edit.className = 'edit';
			edit.style.height = `${this._task.offsetHeight}px`;
			this._task.classList.toggle('hidden');
			this._task.after(edit);
			edit.value = this._textOfTask.innerHTML; // set focus to the last character in textarea
			edit.focus();
			edit.onkeyup = (e) => {
				if(e.key == 'Escape') {
					edit.remove();
					this._task.classList.toggle('hidden');
				}
				if(e.key == 'Enter' && e.ctrlKey) {
					this._textOfTask.innerHTML = edit.value;
					edit.remove();
					this._task.classList.toggle('hidden');
				}		
			};
		};
	}
}

let tasksToDo;
let tasks = [];

// do on load
document.addEventListener('DOMContentLoaded', () => {
	newTask.focus();
	let tasksNumber = +localStorage['tasksNumber'];
	if (!tasksNumber) return;
	for(let i = 0; i < tasksNumber; i++) {
		let task = JSON.parse( localStorage[`task${i}`] );
		tasks.push( new Task(task[0], task[1]) );
	}
	showCount();
});

// do before unload
window.onbeforeunload = () => {
	tasks.forEach( (task, i) => {
		let json = JSON.stringify( [ task._textOfTask.innerHTML, task._made] )
		localStorage[`task${i}`] = json;
	});

	//delete all extra slots in local storage
	let tasksNumber = +localStorage['tasksNumber'];
	for(let i = tasks.length; i < tasksNumber ; i++) {
		delete localStorage[`task${i}`];
	}

	localStorage['tasksToDo'] = tasksToDo;
	localStorage['tasksNumber'] = tasks.length;
};

// create a task
newTask.onkeyup = function(e) {
	if( !(e.key == 'Enter' && e.ctrlKey) || !this.value ) return;
	tasks.push( new Task(this.value) );
	showCount();
	this.value = '';
};

function showCount() {
	tasksToDo = tasks.filter( task => { return !task._made; } ).length;
	switch (tasksToDo) {
		case 0:
			taskListHeader.innerHTML = `Nothing to do... boring...`;
			break;
		case 1:
			taskListHeader.innerHTML = `To do <span class="tasksToDo">1</span>  task <br> Double click to edit.<br>  "Ctrl+Enter" to save. Esc to exit`;
			break;
		default:
			taskListHeader.innerHTML = `To do <span class="tasksToDo">${tasksToDo}</span> tasks <br> Double click to edit.<br>  "Ctrl+Enter" to save. Esc to exit`;
			break;
	}
}