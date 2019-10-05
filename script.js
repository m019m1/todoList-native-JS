const taskList = document.getElementById('taskList');
const taskCreator__editor = document.getElementById('taskCreator__editor');
const taskListHeader = document.getElementById('taskListHeader');
const save = document.getElementById('save');

class Task {
	constructor (text, done = false) {
		this._task = document.createElement('li');
		this._task.className = 'task';
		taskList.append(this._task);
	
		this._doneCheckbox = document.createElement('input');
		this._doneCheckbox.className = 'doneCheckbox';
		this._doneCheckbox.type = 'checkbox';
		this._task.append(this._doneCheckbox);
		
		this._close = document.createElement('button');
		this._close.className = 'close hidden';
		this._close.innerHTML = 'x';
		this._task.append(this._close);
	

		this._textOfTask = document.createElement('p');
		this._textOfTask.className = 'textOfTask';
		this._textOfTask.innerHTML = text;
		this._task.append(this._textOfTask);
	
		this._done = done;
		this._running =  true;
		this.run();
	}

	run() {
		if(this._done) {
			this._task.classList.add('doneTask');
			this._doneCheckbox.setAttribute('checked', 'checked');
			this._close.classList.toggle('hidden');
		}

		this._doneCheckbox.onclick = () => {
			this._task.classList.toggle('doneTask');
			this._close.classList.toggle('hidden');
			this._done ? this._done = false : this._done = true;
			showCount();
		};

		this._close.onclick = () => {
			this._task.remove();
			this._running = false;
			tasks = tasks.filter( task => {
				return task._running;
			});
			taskCreator__editor.focus();
		};

		this._task.ondblclick = () => {
			if(event.currentTarget.classList.contains('doneTask')) return;
			taskCreator__editor.value = '';
			const edit = document.createElement('textarea');
			edit.className = 'edit';
			edit.style.height = `${this._task.offsetHeight}px`;
			this._task.classList.toggle('hidden');
			this._task.after(edit);
			edit.value = this._textOfTask.innerHTML; // set focus to the last character in textarea
			edit.focus();
			
			edit.onkeyup = (e) => {
				if(e.key == 'Escape') {
					edit.blur();
				}
				if(e.key == 'Enter' && e.ctrlKey) {
					this._textOfTask.innerHTML = edit.value;
					edit.blur();
				}
			};
			edit.onblur = () => {
				save.addEventListener('click', editTask.bind(this));
				edit.remove();
				this._task.classList.toggle('hidden');
				
				// it's need to remove event listener ANYWAY, even if 'save' button wouldn't pressed.
				// So we need to call removeEventListener instead of call addEventListener 
				// with option {once = true} (option "once" wouldn't work if 'save' button wouldn't pressed)
				save.removeEventListener('click', editTask.bind(this));
			};
			function editTask () {
					this._textOfTask.innerHTML = edit.value;
			}
		};
	}
}

let tasksToDo;
let tasks = [];

// do on load
document.addEventListener('DOMContentLoaded', () => {
	taskCreator__editor.focus();
	const tasksNumber = +localStorage['tasksNumber'];
	if (!tasksNumber) return;
	for(let i = 0; i < tasksNumber; i++) {
		const task = JSON.parse( localStorage[`task${i}`] );
		tasks.push( new Task(task[0], task[1]) );
	}
	showCount();
});

// do before unload
window.onbeforeunload = () => {
	tasks.forEach( (task, i) => {
		const json = JSON.stringify( [ task._textOfTask.innerHTML, task._done] )
		localStorage[`task${i}`] = json;
	});

	//delete all extra slots in local storage
	const tasksNumber = +localStorage['tasksNumber'];
	for(let i = tasks.length; i < tasksNumber ; i++) {
		delete localStorage[`task${i}`];
	}

	localStorage['tasksToDo'] = tasksToDo;
	localStorage['tasksNumber'] = tasks.length;
};

// create a task
save.onclick = () => {
	if(!taskCreator__editor.value) return;
	addTask();
	taskCreator__editor.focus();
};
taskCreator__editor.onkeyup = function(e) {
	if(!(e.key == 'Enter' && e.ctrlKey) || !this.value) return;
	addTask();
};

function addTask() {
	tasks.push( new Task(taskCreator__editor.value) );
	showCount();
	taskCreator__editor.value = '';
}
function showCount() {
	tasksToDo = tasks.filter( task => { return !task._done; } ).length;
	const tooltip = document.getElementById('tooltip');
	switch (tasksToDo) {
		case 0:
			taskListHeader.innerHTML = `Nothing to do... boring...`;
			tooltip.classList.add('hidden');
			break;
		case 1:
			taskListHeader.innerHTML = `To do <span class="tasksToDo">1</span>  task`;
			tooltip.classList.remove('hidden');
			break;
		default:
			taskListHeader.innerHTML = `To do <span class="tasksToDo">${tasksToDo}</span> tasks`;
			tooltip.classList.remove('hidden');
			break;
	}
}