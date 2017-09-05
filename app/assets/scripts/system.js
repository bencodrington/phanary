import $ from 'jquery';
import timesteps from './modules/OneShotTimesteps.js';

//  The set of all field names for the different types of items (atmospheres, loops, oneshots)
const fieldNames = ['_id', 'name', 'tags', 'oneshots', 'tracks', 'source', 'filename', 'samples'];

var $sections       = $('.system__section');
var $inputs         = $('.system__section__input');
var $loopDropbox    = $('#loop-dropbox');
var $oneshotDropbox = $('#oneshot-dropbox');
var $saveBtn        = $('#save-btn');
var $deleteBtn      = $('#delete-btn');
hideDropboxes();
hideAll();
events();

function events() {

    $('.system-sidebar__section__title').on('click', (event) => {
        var $target = $(event.target);
        var sidebarSection = $target.data('sidebar-section');    // 'atmosphere', 'loop', or 'oneshot'
        var $list = $target.siblings('.system-sidebar__list');
        toggleCollection($list);   //  Show or hide the relevant sidebar section
        if ($list.is(':visible')) {
            loadCollection(sidebarSection, $list);
        }
    });

    $('.sidebar').on('click', (event) => {
        if ($(event.target).is('.sidebar')) {
            hideAll();  //  Event was triggered directly on the sidebar background
        }
    });

    $('.system__section').on('dragover', (event) => {
        event.preventDefault();
    });

    $('.system__section__dropbox').
    on('dragover', (event) => {
        event.preventDefault(); //  Allow elements to be dropped here
    }).
    on('drop', (event) => {
        onDropboxDrop(event);
        hideDropboxes();
        invalidateRecord();
    })

    $inputs.on('input', () => {
        invalidateRecord();
    });

    $saveBtn.on('click', saveItem);
    $deleteBtn.on('click', deleteItem)

    $('.system__btn--add').on('click', (event) => {
        var collection = event.target.dataset.collection;
        switchToCollection(collection);
        clearVisibleInputs();
    });
}

function hideAll() {
    $('.system-sidebar__list').hide();      //  Hide all sidebar lists
    $sections.hide();                       //  Hide all fields and inputs
    $('.system__record-control').hide();    //  Hide 'Save' and 'Delete' buttons
}

function hideDropboxes() {
    $loopDropbox.hide();
    $oneshotDropbox.hide();
}

function toggleCollection($list) {
    $list.toggle();
}

function getCollection() {
    return $sections.filter(':visible').data('collection');
}

function refreshCollection(collection) {
    // Find list with matching data-collection attribute
    var $list = $('.system-sidebar__list').filter((i, element) => {
        return $(element).data('collection') === collection;
    });
    loadCollection(collection, $list);
    return $list;
}

function loadCollection(collection, $list) {
    var query = {
        'collection': collection
    };
    $.getJSON('/system/get', query, (results) => {
        displayCollection(results, collection, $list);
    });
}

function displayCollection(results, collection, $list) {
    $list.empty();
    $.each(results, (i, result) => {
        //  Create a new list element for each result
        $('<li>', {'draggable': (collection !== 'atmospheres'), 'data-id': result._id, 'data-collection': collection}).
        on('dragstart', (event) => {
            liDragStart(event);
        }).
        append(
            $('<span>').text(result.name)
        ).
        //  Display details of selected item
        on('click', () => {
            switchToItem(collection, result._id);
        }).
        //  Append the li to the list
        appendTo($list);
    });
}

function liDragStart(event) {
    event.stopPropagation();
    // Record resource id in the drag event
    var id = event.target.dataset.id;
    event.originalEvent.dataTransfer.setData("text", id);

    // Show the relevant dropbox
    var collection = event.target.dataset.collection;
    if (collection === "tracks") {
        $loopDropbox.show();
    } else if (collection === "oneshots") {
        $oneshotDropbox.show();
    }
}

function switchToItem(collection, id) {
    //  Display relevant fields and inputs
    switchToCollection(collection);
    //  Get data to populate relevant fields
    fetchItem(collection, id, populateInputs);
    //  Display 'delete' button
    $deleteBtn.show();
}

function switchToCollection(collection) {
    var $section;
    $.each($sections, (i, section) => {
        $section = $(section);
        if($section.data('collection') === collection) {
            $section.show();
        } else {
            $section.hide();
        }
    });
}

function fetchItem(collection, id, callback) {
    var query = {
        'collection': collection,
        'id': id
    };
    $.getJSON('/system/find', query, function(result) {
        callback(result);
    }).
    fail(() => {
        callback(null);
    });
}

function getInputs() {
    return $sections.
        filter(':visible').
        find('.system__section__input');
}

function clearVisibleInputs() {
    var $visibleInputs = getInputs();
    $visibleInputs.filter('textarea, input[type=text]').val('');    // Empty textboxes and textareas
    $visibleInputs.filter('input[type=range]').val(1);              // Reset sliders to full
    $visibleInputs.filter('.system__atmosphere-children').empty();  // Remove loop and one-shot children
}

function populateInputs(data) {
    //  Cache system__section__inputs in the currently visible section
    var $visibleInputs = getInputs();
    var $field;
    for (var key in data) {
        if ($.inArray(key, fieldNames) >= 0) {
            //  'key' matches one of the field names,
            //  so find the input with that name
            $field = $visibleInputs.filter('[name="' + key + '"]');
            writeValue($field, key, data[key]);  // Store the value in the input
        }
    }
}

function saveItem() {
    // TODO: check for validity (esp. oneshot timings)
    var name;
    var query = {};
    query.collection = getCollection();
    // Cache system__section__inputs in the currently visible section
    var $visibleInputs = getInputs();
    
    $visibleInputs.each((i, element) => {
        name = element.getAttribute('name');
        if (name === '_id') {
            query.id = element.value;
        } else {
            query[name] = readValue($(element), name);
        }
    });

    if (query.id === '') {
        insertItem(query);  // Create new record
    } else {
        // Update existing record
        updateItem(query);
    }
}

function deleteItem() {
    var query = {};
    query.collection = getCollection();
    // Cache system__section__inputs in the currently visible section
    var $visibleInputs = getInputs();
    var $idField = $visibleInputs.filter((i, element) => {
        return element.getAttribute('name') === '_id';
    });
    query.id = $idField.val();
    $.post('/system/delete', query, function() {
        hideAll();
        toggleCollection(refreshCollection(query.collection));
    });
}

function insertItem(query) {
    $.post('/system/insert', query, function() {
        hideAll();
        toggleCollection(refreshCollection(query.collection));
    });
}

function updateItem(query) {
    $.post('/system/update', query, function () {
        hideAll();
        toggleCollection(refreshCollection(query.collection));
    });
}

/*
    Converts a piece of data to the correct format,
    then writes it to the provided field.
*/
function writeValue($field, key, value) {
    if ($field.is('input')) {           //  Simple one-line textbox
        $field.val(value);
    } else if ($field.is('textarea')) { //  Multi-line textbox, requires parsing
        if (key === 'samples') {
            $field.val(parseSamples(value));
        } else {    //  tags
            $field.val(parseArray(value));
        }
    } else if ($field.is('table')) {    //  Atmosphere 'Loops' or 'One-Shots' special field
        $field.html(parseAtmosphereChildren(value, key));
    }
}

function readValue($field, name) {
    if (name === 'tracks') {
        return parseLoopTable($field);
    } else if (name === 'oneshots') {
        return parseOneshotTable($field);
    }
    return $field.val();
}

function parseLoopTable($field) {
    var loops = [];
    var loop;
    $field.children().each((i, element) => {
        loop = {};
        loop.id = element.getAttribute('data-id');
        loop.volume = $(element).find('input[name=volume]').val();
        loops.push(loop);
    });
    return JSON.stringify(loops);
}

function parseOneshotTable($field) {
    var oneshots = [];
    var oneshot, $element;
    $field.children().each((i, element) => {
        oneshot = {};
        $element = $(element);
        oneshot.id = element.getAttribute('data-id');
        oneshot.volume = $element.find('input[name=volume]').val();
        oneshot.minIndex = $element.find('input[name=minIndex]').val();
        oneshot.maxIndex = $element.find('input[name=maxIndex]').val();
        oneshots.push(oneshot);
    });
    return JSON.stringify(oneshots);
}

function parseSamples(array) {
    if (!array) {
        return 'n/a';
    }
    var samples = [];
    array.forEach(function(sample) {
        samples.push(sample.filename);
    });
    return samples.toString().split(',').join('\n');
}

function parseArray(array) {
    if (!array) {
        return 'n/a';
    }
    return array.toString().split(',').join('\n');
}

/* 
    Takes an array of atmosphere children data objects(e.g. loops or one-shots),
    and creates the contents of a <table> element with them, then returns the
    jQuery object containing them.
*/
function parseAtmosphereChildren(children, collection) {
    var $child;
    var $children = $();
    $.each(children, (i, child) => {
        $child = generateChildHTML(child, collection);
        $children = $children.add($child);
    });
    return $children;
}

/*
    Creates a jQuery object representing a <tr> in an atmosphere's
    'Loops' or 'One-Shots' <table>.
    child contains:
        volume[, minIndex, maxIndex if child is a one-shot] and id
    TODO: replace this function with a handlebars template
*/
function generateChildHTML(child, collection) {
    var $slider, $remove, $name, $indices, $child;
    $slider = $('<td>').
    append(
        $('<label>', {'for': 'volume'}),
        $('<input>', {'type': 'range', 'name': 'volume', 'max': 1, 'step': 0.1, 'value': child.volume})
    );
    $remove = $('<td>').append(
        $('<div>', {'class': 'btn btn btn--rounded btn--medium'}).append(
            $('<div>', {'class': 'btn__inner'}).append(
                $('<i>', {'class': 'fa fa-close', 'aria-hidden': 'true'})
            )
        )
    ).on('click', (event) => {
        $child.remove();
        invalidateRecord();
    });
    $name = $('<td>').
    text('Loading name...');
    if (collection === "oneshots") {
        $indices = $('<td>').
        append(
            $('<span>').text('MIN: '),
            $('<span>').addClass('system__timestep').text('n/a'),
            $('<input>', {'type': 'number', 'name': 'minIndex', 'min': 0, 'max': timesteps.length - 1, 'value': child.minIndex}),
            $('<span>').text('MAX: '),
            $('<span>').addClass('system__timestep').text('n/a'),
            $('<input>', {'type': 'number', 'name': 'maxIndex', 'min': 0, 'max': timesteps.length - 1, 'value': child.maxIndex})
        );
        $indices.children('input').each((i, element) => {
            updateTimestep(element);
        })
        $indices.children('input').on('input', (event) => {
            updateTimestep(event.target);
        });
    };
    $child = $('<tr>', {'data-id': child.id}).  // Store id value for future updating
    append(
        $name,
        $slider
    );
    if (collection === "oneshots") {
        $child.append($indices);
    }
    $child.append($remove);
    //  Begin fetching child name
    injectName(collection, child.id, $name);
    return $child;
}

/*
    $field: the jQuery object to inject the fetched name into. Must have a text component.
*/
function injectName(collection, id, $field) {
    fetchItem(collection, id, (result) => {
        if (!result || result.error || result.name === undefined) {
            $field.text('Error loading name for: ' + id);
        } else {
            $field.text(result.name);
        }
    });
}

/*
    Given the HTML element of a number input, uses that input's value as an index to find
    the relevant timestep value in seconds, and injects that into the relevant timestep label.
*/
function updateTimestep(inputHTML) {
    var $span = $(inputHTML).prev('.system__timestep'); // Find text element to update
    $span.text(timesteps[inputHTML.value]);
}

function onDropboxDrop(event) {
    event.preventDefault();
    var collection = event.target.dataset.collection;
    var childData = {};
    childData.volume = 1;
    childData.id = event.originalEvent.dataTransfer.getData("text");
    if (collection === "oneshots"){
        childData.minIndex = 0;
        childData.maxIndex = 0;
    }
    var $child = generateChildHTML(childData, collection);
    // Select table that corresponds to this dropbox
    var $table = $('.system__atmosphere-children').filter((i, element) => {
        return $(element).data('collection') === collection;
    });
    $table.append($child);
}

function invalidateRecord() {
    // Display 'save' button
    $saveBtn.show();
    // TODO: prompt an 'are you sure?' alert when attempting to switch before saving
}