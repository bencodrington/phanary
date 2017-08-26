import $ from 'jquery';

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

var $sections   = $('.system__section');
$('.system-sidebar__list').hide();  //  Hide all sidebar lists
$sections.hide();                   //  Hide all fields and inputs

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
        var $li = $('<li>').
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

function switchToItem(collection, id) {
    //  Display relevant fields and inputs
    switchToCollection(collection);
    //  Get data to populate relevant fields
    fetchItem(collection, id);
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

function fetchItem(collection, id) {
    var query = {
        'collection': collection,
        'id': id
    };
    $.getJSON('/system/find', query, function(result) {
        if (result.error) {
            return;
        }
        populateFields(result);
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
            console.log(key);
            console.log($field);
            console.log(data[key]);
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
        //TODO: replace table contents
    }
}


modify.$collection.change(function() {
    changeCollection(this.value);
});

modify.$id.on('input', function() {
    updateButtons(this.value);
    fetchItem(getCollection(), this.value);
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

function parseArray(array) {
    if (!array) {
        return 'n/a';
    }
    return array.toString().split(',').join('\n');
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