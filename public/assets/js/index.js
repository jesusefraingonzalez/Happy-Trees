$(document).ready(() => sessionStorage.setItem('edit', false));
const loadImage = new Event('load-image');
const clearCanvas = new Event('clear-canvas');
const saveButton = $('#save-drawing');
const titleEl = $('#drawing-title');

// creating and naming new list items.
$('#saveButtonModal').on('click', () => {
    const title = titleEl.val().trim();
    const body = window._json;
    const editMode = sessionStorage.getItem('edit');

    if (editMode !== 'true') {
        $.post('/api/drawings', { title, body }).then(data => {
            createElement(data.title, data.id);
            document.dispatchEvent(clearCanvas);
        });
    } else if (editMode) {
        const id = sessionStorage.getItem('current-drawing');

        $.ajax({
            url: `/api/drawings/${id}`,
            data: { title, body },
            type: 'PUT',
        }).then(() => {
            $(`[data-id=${id}]`).children('a.alert-link').text(title);
            setSession(false);
            document.dispatchEvent(clearCanvas);
        });
    }
    titleEl.val('');
});

$('#clearButton').on('click', () => {
    const clearCanvas = new Event('clear-canvas');
    setSession(false);
    document.dispatchEvent(clearCanvas);
});

//deleting list item
$(document).on('click', '.delete-note', event => {
    event.stopPropagation();
    let $this = event.currentTarget;
    let drawingId = $this.dataset.id;
    let listEl = $this.parentElement.parentElement;

    //delete request
    $.ajax({
        url: '/api/drawings/' + drawingId,
        type: 'DELETE',
    }).then(() => {
        listEl.remove();

        // if the current active drawing is deleted, clear the canvas and change the session values
        if (drawingId === sessionStorage.getItem('current-drawing')) {
            document.dispatchEvent(clearCanvas);
            setSession(false);
        }
    });
});

$(document).on('click', '#drawing-list li', event => {
    let $this = $(event.currentTarget);
    const id = $this.attr('data-id');
    const title = $this.attr('data-title');

    setSession(true, title, id);

    $.get(`/api/drawings/${id}`, data => {
        window._json = data.body;
        document.dispatchEvent(loadImage);
    });
});

const createElement = (title, id) => {
    const $li = $('<li>')
        .addClass('list-group-item')
        .attr('data-id', id)
        .attr('data-title', title);
    const $a = $('<a>').text(title).attr('href', '#').attr('class', 'alert-link');
    const $a2 = $('<a>').attr('href', '#');
    const $i = $('<i>')
        .addClass('fas fa-trash-alt float-right text-secondary delete-note')
        .attr('data-id', id)
        .attr('data-title', title);

    $a2.append($i);
    $li.append($a).append($a2);
    $('#drawing-list').append($li);
};

// updates an element's data-title and data-id
const updateElement = (element, title, id) => {
    let $element = $(element);
    $element.attr('data-id', id).attr('data-title', title);
};

const setSession = (edit, title, id) => {
    sessionStorage.setItem('edit', edit);

    if ((title && !id) || (!title && id)) {
        console.error(
            'setSession() cannot have only a title or only an id. Must have both or none'
        );
    } else if (edit) {
        sessionStorage.setItem('current-title', title);
        sessionStorage.setItem('current-drawing', id);
        titleEl.val(title);
        saveButton.text('Update');
    } else if (!edit && title && id) {
        sessionStorage.setItem('current-title', title);
        sessionStorage.setItem('current-drawing', id);
        titleEl.val('');
        saveButton.text('Save');
    } else {
        sessionStorage.setItem('current-title', null);
        sessionStorage.setItem('current-drawing', null);
        titleEl.val('');
        saveButton.text('Save');
    }
};

$(window).resize(() => {
    $('#myCanvas').css({ width: '100%', height: '100%' });
});
