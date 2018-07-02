var ffmpeg = require('fluent-ffmpeg');

// The file that is making problems
var inputFile = '/Epilogue.mp3';
// The desired file, including format (e.g. '.webm')
var outputFile = 'epilogueNew.webm';

ffmpeg(inputFile)
    // This line is the workaround that fixes the
    //  'Too many packets buffered for output stream 0:1.'
    // error.
    .outputOptions('-max_muxing_queue_size 9999')

    // Log output
    .on('stderr', function(stderrLine) {
        console.log('Stderr output: ' + stderrLine);
    })
    .on('error', function(err, stdout, stderr) {
        console.log('Cannot process video: ' + err.message);
    })

    // Finally, save the new file
    .save(outputFile);