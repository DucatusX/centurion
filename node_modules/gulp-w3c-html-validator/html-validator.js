// gulp-w3c-html-validator
// Gulp plugin to validate HTML using the W3C Markup Validation Service
// https://github.com/center-key/gulp-w3c-html-validator
// MIT License

// Imports
const color =       require('ansi-colors');
const PluginError = require('plugin-error');
const log =         require('fancy-log');
const through2 =    require('through2');
const w3cjs =       require('w3cjs');

// Setup
const pluginName = 'gulp-w3c-html-validator';

// Gulp plugin
const plugin = {

   handleMessages: (file, messages, options) => {
      // Parameters:
      //    file -     array of files to validate
      //    messages - array of messages returned by w3cjs
      //    options -  settings object
      // Returns:
      //    boolean indicating success (true if no errors occurred)
      const text = {
         error:   color.red.bold('HTML Error:'),
         warning: color.yellow.bold('HTML Warning:'),
         into:    color.green.bold('HTML Info:')
         };
      const lines = file.contents.toString().split(/\r\n|\r|\n/g);
      let success = true;
      const processMessage = (message) => {
         // Example message object:
         //    {
         //       type:         'error',
         //       message:      'Unclosed element “h1”.',
         //       extract:      '<body>\n   <h1>Specif',
         //       lastLine:     8,
         //       firstColumn:  4,
         //       lastColumn:   7,
         //       hiliteStart:  10,
         //       hiliteLength: 4
         //    }
         if (options.verifyMessage && !options.verifyMessage(message.type, message.message))
            return;  //skip this message
         if (message.type === 'info' && !options.showInfo)
            return;  //skip this message
         success = success && message.type !== 'error';
         const type = text[message.type] || text.warning;
         const line = message.lastLine || 0;
         const column = message.lastColumn || 0;
         const location = 'Line ' + line + ', Column ' + column + ':';
         let erroredLine = lines[line - 1];
         let errorColumn = message.lastColumn;
         const trimErrorLength = () => {
            erroredLine = erroredLine.slice(errorColumn - 50);
            errorColumn = 50;
            };
         const formatErroredLine = () => {
            if (errorColumn > 60)
               trimErrorLength();
            erroredLine = erroredLine.slice(0, 60);  //trim after so the line is not too long
            erroredLine =  //highlight character with error
               color.gray(erroredLine.substring(0, errorColumn - 1)) +
               color.red.bold(erroredLine[errorColumn - 1]) +
               color.gray(erroredLine.substring(errorColumn));
            };
         if (erroredLine)  //if false, stream was changed since validation
            formatErroredLine();
         if (typeof message.lastLine !== 'undefined' || typeof lastColumn !== 'undefined')
            log(type, file.relative, location, message.message);
         else
            log(type, file.relative, message.message);
         if (erroredLine)
            log(erroredLine);
         };
      if (Array.isArray(messages))
         messages.forEach(processMessage);
      else
         log(text.warning, 'Failed to run validation on', file.relative);
      return success;
      },

   htmlValidator: (options) => {
      options = options || {};
      if (typeof options.url === 'string')
         w3cjs.setW3cCheckUrl(options.url);
      const transform = (file, encoding, done) => {
         const handleValidation = (error, response) => {
            if (error)
               console.log(error);
            file.w3cjs = {
               success:  plugin.handleMessages(file, response.messages, options),
               messages: response.messages
               };
            done(null, file);
            };
         const w3cjsOptions = {
            proxy:    options.proxy,
            input:    file.contents,
            callback: handleValidation
            };
         if (file.isNull())
            done(null, file);
         else if (file.isStream())
            done(new PluginError(pluginName, 'Streaming not supported'));
         else
            w3cjs.validate(w3cjsOptions);
         };
      return through2.obj(transform);
      },

   reporter: () => {
      const transform = (file, encoding, done) => {
         done(null, file);
         if (file.w3cjs && !file.w3cjs.success)
            throw new PluginError(pluginName, 'HTML validation error(s) found');
         };
      return through2.obj(transform);
      }

   };

// Module loading
module.exports = plugin.htmlValidator;
module.exports.reporter = plugin.reporter;
module.exports.setW3cCheckUrl = w3cjs.setW3cCheckUrl;
