import $ from 'jquery';
import timesteps from './modules/OneShotTimesteps.js';

var modify                  = {};
modify.$collection          = $('input[type=radio][name=collection]');
modify.$fields              = $('.modify__field');
modify.$id                  = modify.$fields.children('input[name=id]');
modify.$trackFields         = modify.$fields.filter('.track-field');
modify.$atmosphereFields    = modify.$fields.filter('.atmosphere-field');
modify.$oneshotFields       = modify.$fields.filter('.oneshot-field');
modify.$button              = $('.modify__btn');
modify.$delete              = $('.modify__btn-delete');
modify.$subtitle            = $('.modify .system-section__subtitle');
var $displayTable           = $('#display-table');

modify.$fields.hide();
modify.$delete.hide();

//  The set of all field names for the different types of items (atmospheres, loops, oneshots)
const fieldNames = ['_id', 'name', 'tags', 'oneshots', 'tracks', 'source', 'filename', 'samples'];

var $sections       = $('.system__section');
var $loopDropbox    = $('#loop-dropbox');
var $oneshotDropbox = $('#oneshot-dropbox');
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
    })
}

function hideAll() {
    $('.system-sidebar__list').hide();  //  Hide all sidebar lists
    $sections.hide();                   //  Hide all fields and inputs
}

function hideDropboxes() {
    $loopDropbox.hide();
    $oneshotDropbox.hide();
}

function toggleCollection($list) {
    $list.toggle();
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
    fetchItem(collection, id, populateFields);
}

function switchToCollection(collection) {
    var $section;
    $.each($sections, (i, section) => {
        $section = $(section);
        if($section.data('section') === collection) {
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

function populateFields(data) {
    //  Cache system__section__inputs in the currently visible section
    var $inputs = $sections.filter(':visible')
    .find('.system__section__input');
    var $field;
    for (var key in data) {
        if ($.inArray(key, fieldNames) >= 0) {
            //  'key' matches one of the field names,
            //  so find the input with that name
            $field = $inputs.filter('[name="' + key + '"]');
            writeValue($field, key, data[key]);  // Store the value in the input
        }
    }
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
    );
    $name = $('<td>').
    text('Loading name...');
    if (collection === "oneshots") {
        $indices = $('<td>').
        append(
            $('<span>').text('MIN: '),
            $('<span>').addClass('system__timestep').text('n/a'),
            $('<input>', {'type': 'number', 'min': 0, 'max': timesteps.length - 1, 'value': child.minIndex}),
            $('<span>').text('MAX: '),
            $('<span>').addClass('system__timestep').text('n/a'),
            $('<input>', {'type': 'number', 'min': 0, 'max': timesteps.length - 1, 'value': child.maxIndex})
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

modify.$collection.change(function() {
    changeCollection(this.value);
});

modify.$id.on('input', function() {
    updateButtons(this.value);
    fetchItem(getCollection(), this.value, populateFields);
});


modify.$button.on('click', function() {
    if ($(this).find('span').text() == 'Insert') {
        insertData();
    } else {
        updateData();
    }
});

modify.$delete.on('click', deleteData);

function clearFields() {
    modify.$fields.children('input, textarea').val('');
    updateButtons('');
}

function getCollection() {
    return modify.$collection.filter(':checked').val();
}

function changeCollection(newCollection) {
    clearFields();
    loadCollection(newCollection);
    updateSubtitle(newCollection);
    var newFields;
    switch(newCollection) {
        case 'tracks':
            newFields = modify.$trackFields;
            break;
        case 'atmospheres':
            newFields = modify.$atmosphereFields;
            break;
        case 'oneshots':
            newFields = modify.$oneshotFields;
            break;
        default:
            console.error('system.js/changeCollection: Invalid collection: ' + newCollection);
    }

    if (modify.$id.is(":visible")) {
        modify.$fields.hide('fast', function() {
            newFields.show('fast');
        });
    } else {
        newFields.show('fast');
    }
}

function updateButtons(value) {
    if (value === '') {
        modify.$button.find('span').text('Insert');
        modify.$delete.hide();
    } else {
        modify.$button.find('span').text('Update');
        modify.$delete.show();
    }
}

function updateSubtitle(newCollection) {
    modify.$subtitle.text(newCollection);
}

function parseIDs(array, collection, showNames) {
    if (!array) {
        return 'n/a';
    }
    var ids = [];
    var idWithName;
    array.forEach(function(element) {
        idWithName = element.id;
        if (showNames) {
            idWithName += '(' + getResourceName(element.id, collection) + ')';
        }
        ids.push(idWithName);
    });
    return ids.toString().split(',').join('\n');
}

function insertData() {
    var query = getProperties();
    $.post('/system/insert', query, function() {
        loadCollection(getCollection());
        clearFields();
    });
}

function updateData() {
    var query = getProperties();
    query.id = getProperty('id');
    $.post('/system/update', query, function () {
        loadCollection(getCollection());
    });
}

function deleteData() {
    var query = {
        'collection': getCollection(),
        'id': getProperty('id')
    };
    $.post('/system/delete', query, function() {
        loadCollection(getCollection());
        clearFields();
    });
}

function getProperties() {
    var query = {
        'collection': getCollection(),
        'name': getProperty('name'),
        'filename': getProperty('filename'),
        'tags': getProperty('tags'),
        'tracks': getProperty('tracks'),
        'oneshots': getProperty('oneshots'),
        'samples': getProperty('samples'),
        'source': getProperty('source')
    };
    // console.log('getProperties: properties:');
    // console.log(query);
    return query;
}

function getProperty(property) {
    switch(property) {
        case 'id': return modify.$id.val();
        case 'name': return modify.$fields.children('input[name=name]').val();
        case 'filename': return modify.$fields.children('input[name=filename]').val();
        case 'tags': return modify.$fields.children('textarea[name=tags]').val();
        case 'tracks': return modify.$fields.children('textarea[name=tracks]').val();
        case 'oneshots': return modify.$fields.children('textarea[name=oneshots]').val();
        case 'samples': return modify.$fields.children('textarea[name=samples]').val();
        case 'source': return modify.$fields.children('input[name=source]').val();
    }
}

function getResourceName(id, collection) {

    var query = {
        'collection': collection,
        'id': id
    };
    var returnText;

    $.ajaxSetup({
        async: false
    });

    $.getJSON('/system/find', query, function(result) {
        if (result.error) {
            returnText =  'Not Defined';
        } else {
            returnText =  result.name;
        }
    });

    $.ajaxSetup({
        async: true
    });

    return returnText;
}