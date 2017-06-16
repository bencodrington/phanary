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

function fetchItem(collection, id) {
    
    var query = {
        'collection': collection,
        'id': id
    };
    $.getJSON('/system/find', query, function(result) {
        if (result.error) {
            return;
        }
        modify.$fields.children('input[name=name]').val(result.name);
        if (result.filenames) {
            modify.$fields.children('textarea[name=filenames]').val(parseArray(result.filenames));
        }
        if (result.tags) {
            modify.$fields.children('textarea[name=tags]').val(parseArray(result.tags));
        }
        if (result.tracks) {
            modify.$fields.children('textarea[name=tracks]').val(parseIDs(result.tracks));
        }
        if (result.oneshots) {
            modify.$fields.children('textarea[name=oneshots]').val(parseIDs(result.oneshots));
        }
        
    });
}

function parseArray(array) {
    return array.toString().split(',').join('\n');
}

function parseIDs(array) {
    var ids = [];
    array.forEach(function(element) {
        ids.push(element.id);
    });
    return ids.toString().split(',').join('\n');
}

function loadCollection(collection) {
    var query = {
        'collection': collection
    };
    $.getJSON('/system/get', query, displayCollection);
}

function displayCollection(results) {
    $displayTable.find('tbody tr').remove();
    $.each(results, function(i, result) {
        var $tr = $('<tr>').
        append(
            $('<td>').text(result._id),
            $('<td>').text(result.name),
            $('<td>').text(result.filenames),
            $('<td>').text(result.tags),
            $('<td>').text(result.tracks),
            $('<td>').text(result.oneshots)
        ).
        appendTo($displayTable.find('tbody'));

        // Rig click event
        $tr.on('click', function() {
            var newId = $tr.find('td:first-child').text();
            modify.$id.val(newId);
            updateButtons();
            fetchItem(getCollection(), newId);
        });
    });
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
    console.log(query);
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
        'filenames': getProperty('filenames'),
        'tags': getProperty('tags'),
        'tracks': getProperty('tracks'),
        'oneshots': getProperty('oneshots')
    };
    console.log('getProperties: properties:');
    console.log(query);
    return query;
}

function getProperty(property) {
    switch(property) {
        case 'id': return modify.$id.val();
        case 'name': return modify.$fields.children('input[name=name]').val();
        case 'filenames': return modify.$fields.children('textarea[name=filenames]').val();
        case 'tags': return modify.$fields.children('textarea[name=tags]').val();
        case 'tracks': return modify.$fields.children('textarea[name=tracks]').val();
        case 'oneshots': return modify.$fields.children('textarea[name=oneshots]').val();
    }
}