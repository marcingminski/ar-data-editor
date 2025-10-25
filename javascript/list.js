/*! list.js | v1.1.6 2019/10 AOR, LTD. | https://github.com/aor-app/ar-data-editor */
let currentMemoryData = null;
let current_channel = null;
let currentMemoryBankNo = null;
let currentMemoryChannelNo = null;
let selectedChannels = null;
let selectedFunction = null;
let insertPoint = null;
let templateData = null;
let frequencyList = null;
let multipleDataCreateError = null;
function setFileInfo(){
    $('#file-type').text(`${currentMemoryData.fileType}, ${currentMemoryData.blockType}`);
    $('#file-model').text(currentMemoryData.model);
    $('#file-version').text(currentMemoryData.modelVersion);
    $('#file-registered-at').text(currentMemoryData.registeredAt);
}
function paddingZero(value){
    return  ('00' + value ).slice(-2);
}
function setSelectMemoryBank(){
    if ( currentMemoryData.fileType == SD_BACKUP ){
        $('#select-bank').empty();
        for( let i = 0; i < currentMemoryData.getBanks(); i++ ){
            let bankName = currentMemoryData.getBankName(i);
            let displayText = paddingZero(i);
            if (bankName && bankName.trim() !== '') {
                displayText += ' - ' + bankName;
            }
            $('#select-bank').append(
                $('<option>', { value: i,
                                text: displayText })
            );
        }
        $('#select-bank').val(0).selectmenu('refresh');
        $('#f-select-bank').show();
    }else{
        $('#select-bank').empty();
        $('#select-bank').append(
            $('<option>', { value: 0,
                            text: paddingZero(0) })
        );
        $('#f-select-bank').hide();
    }
}
function setList(memoryBankNo){
    $('#channel-list-popup-screen').remove();
    $('#channel-list-popup-popup').remove();
    $('#channel-list-div').empty();
    let filter = $('<input>', { id: 'channel-search', 'data-type': 'search'});
    let filterForm = $('<form>', {class: 'ui-filterable'}).append(filter);
    let table = $('<table>', {
        'data-role': 'table',
        id: 'channel-list',
        'data-mode': 'columntoggle',
        class: 'ui-responsive table-stroke',
        'data-input': '#channel-search',
        'data-filter': 'true'
    });
    let thead = $('<thead>', { id:'memory_header'});
    let tbody = $('<tbody>', { id:'memory_channels'});
    if ( currentMemoryData.fileType == SD_BACKUP ){
        thead.append($('<tr>').append(
            $('<th>', {'data-priority': 1 , text: 'No' }),
            $('<th>', {'data-priority': 2 , text: 'Frequency' }),
            $('<th>', {'data-priority': 3 , text: 'Title' }),
            $('<th>', {'data-priority': 4 , text: 'Mode' }),
            $('<th>', {'data-priority': 5 , text: 'Edit' })
        ));
        let memoryChannels = currentMemoryData.getBankChannels(memoryBankNo);

        // Count frequencies to identify duplicates
        const frequencyCount = new Map();
        for (let i = 0; i < memoryChannels.length; i++) {
            if (memoryChannels[i].channelRegistedFlg == '1') {
                const frequency = memoryChannels[i].receiveFrequency;
                frequencyCount.set(frequency, (frequencyCount.get(frequency) || 0) + 1);
            }
        }

        for( let i = 0; i < memoryChannels.length; i++ ){
            let no = $('<td>', { 'class': 'ui-checkbox'}).append(
                $('<label>',{ 'for': `line_selected_${i}`} ).append(
                    $('<input>', {type:'checkbox',
                                  name: 'line_selected',
                                  id: `line_selected_${i}`,
                                  'data-enhanced': 'true'
                                 }),
                    $('<span>', {
                        text: paddingZero(i),
                        'class': 'list-no-text'
                    })));
            let frequency = $('<td>', {id: `line_frequency_${i}`});
            let title = $('<td>', {id: `line_title_${i}`, class: 'editable-title'});
            let mode = $('<td>', {id: `line_mode_${i}`});
            if ( memoryChannels[i].channelRegistedFlg == '1' ){
                frequency.append(memoryChannels[i].receiveFrequency);
                // Create editable input for title
                let titleInput = $('<input>', {
                    type: 'text',
                    class: 'title-input',
                    'data-channel': i,
                    value: memoryChannels[i].memoryTag,
                    maxlength: 12,
                    style: 'width: 100%; border: none; background: transparent; font-family: inherit;'
                });
                title.append(titleInput);
                mode.append(memoryChannels[i].modeDescription());
            }
            let edit = $('<td>').append(
                $('<a>',
                  { href: '#page-detail',
                    class: 'ui-btn ui-icon-edit ui-btn-icon-notext ui-corner-all channel_row',
                    id: `channel_${i}`
                  }));

            // Check if this is a duplicate frequency
            let isDuplicate = false;
            if (memoryChannels[i].channelRegistedFlg == '1') {
                const freq = memoryChannels[i].receiveFrequency;
                isDuplicate = frequencyCount.get(freq) > 1;
            }

            const row = $('<tr>', {id: `line_${i}`});
            if (isDuplicate) {
                row.addClass('duplicate-frequency');
            }
            row.append(no, frequency, title, mode, edit);
            tbody.append(row);
        }
        table.addClass('memorychannel-list');
    }else{
        thead.append($('<tr>').append(
            $('<th>', {'data-priority': 1 , text: 'No' }),
            $('<th>', {'data-priority': 2 , text: 'Title' }),
            $('<th>', {'data-priority': 3 , text: 'Mode' }),
            $('<th>', {'data-priority': 4 , text: 'Edit' })
        ));
        let memoryChannels = currentMemoryData.getBankChannels(memoryBankNo);
        for( let i = 0; i < memoryChannels.length; i++ ){
            let no = $('<td>',{ 'class': 'ui-checkbox'}).append(
                $('<label>', { 'for': `line_selected_${i}`}).append(
                    $('<input>', {type:'checkbox',
                                  name: 'line_selected',
                                  id: `line_selected_${i}`,
                                  'data-enhanced': 'true'
                                 }),
                    $('<span>', { text: paddingZero(i),
                                  'class': 'list-no-text'
                                })));
            let title = $('<td>', {id: `line_title_${i}`, class: 'editable-title'});
            let mode = $('<td>', {id: `line_mode_${i}`});
            if ( memoryChannels[i].channelRegistedFlg == '1' ){
                // Create editable input for title
                let titleInput = $('<input>', {
                    type: 'text',
                    class: 'title-input',
                    'data-channel': i,
                    value: memoryChannels[i].memoryTag,
                    maxlength: 12,
                    style: 'width: 100%; border: none; background: transparent; font-family: inherit;'
                });
                title.append(titleInput);
                mode.append(memoryChannels[i].modeDescription());
            }
            let edit = $('<td>').append(
                $('<a>',
                  { href: '#page-detail',
                    class: 'ui-btn ui-icon-edit ui-btn-icon-notext ui-corner-all channel_row',
                    id: `channel_${i}`
                  }));
            tbody.append($('<tr>', {id: `line_${i}`}).append( no, title, mode, edit));
        }
        table.addClass('template-list')
    }
    table.append(thead, tbody);
    $('#channel-list-div').append(filterForm, table).enhanceWithin();

}
function updateLine(memoryChannelNo){
    if ( currentMemoryData.fileType == SD_BACKUP ){
        let memoryBankNo = $('#select-bank').val();
        let channel = currentMemoryData.getChannel(memoryBankNo, memoryChannelNo);
        $(`#line_frequency_${memoryChannelNo}`).text('');
        $(`#line_title_${memoryChannelNo}`).empty();
        $(`#line_mode_${memoryChannelNo}`).text('');
        if ( channel.channelRegistedFlg == '1' ){
            $(`#line_frequency_${memoryChannelNo}`).text(channel.receiveFrequency);
            // Recreate editable input for title
            let titleInput = $('<input>', {
                type: 'text',
                class: 'title-input',
                'data-channel': memoryChannelNo,
                value: channel.memoryTag,
                maxlength: 12,
                style: 'width: 100%; border: none; background: transparent; font-family: inherit;'
            });
            $(`#line_title_${memoryChannelNo}`).append(titleInput);
            $(`#line_mode_${memoryChannelNo}`).text(channel.modeDescription());
        }
    }else{
        let memoryBankNo = $('#select-bank').val();
        let channel = currentMemoryData.getChannel(memoryBankNo, memoryChannelNo);
        $(`#line_title_${memoryChannelNo}`).empty();
        $(`#line_mode_${memoryChannelNo}`).text('');
        if ( channel.channelRegistedFlg == '1' ){
            // Recreate editable input for title
            let titleInput = $('<input>', {
                type: 'text',
                class: 'title-input',
                'data-channel': memoryChannelNo,
                value: channel.memoryTag,
                maxlength: 12,
                style: 'width: 100%; border: none; background: transparent; font-family: inherit;'
            });
            $(`#line_title_${memoryChannelNo}`).append(titleInput);
            $(`#line_mode_${memoryChannelNo}`).text(channel.modeDescription());
        }
    }
}
function setEditMode(fileType){
    setFileInfo();
    setSelectMemoryBank();
    setList(0);
    if( fileType == SD_BACKUP ){
        $('#fn-multiple-data-create-btn').show();
        // Initialize bank name field
        if (currentMemoryData) {
            let bankName = currentMemoryData.getBankName(0);
            $('#bank-name-input').val(bankName);
            $('#f-bank-name').show();
        }
    }else{
        $('#fn-multiple-data-create-btn').hide();
        $('#f-bank-name').hide();
    }
}
function readDataToObject( dataArray ){
    let fileType = null;
    let model = null;
    let blockType = null;
    let version = null;
    let registeredAt = null;
    let selectedMemoryBankNo = null;
    let selectedMemoryChannelNo = null;
    let banks = new Array;
    let channelData = new Array;
    for (let i = 0;i < dataArray.length; i++) {
        switch(dataArray[i][0].substr(0,2)) {
        case 'SD':
        case 'TE':
            fileType = dataArray[i][0];
            blockType = dataArray[i][1];
            model = dataArray[i][2];
            version = dataArray[i][3];
            registeredAt = dataArray[i][4];
            break;
        case 'MC':
            switch(dataArray[i][0]) {
            case 'MC1':
                channelData = dataArray[i];
                break;
            case 'MC2':
                channelData= channelData.concat(dataArray[i]);
                break;
            case 'MC3':
                channelData = channelData.concat(dataArray[i]);
                let bankNo = Number(channelData[1]);
                let channelNo = Number(channelData[2]);
                if ( banks[bankNo] == undefined ){
                    banks[bankNo] = new Array;
                }
                if ( banks[bankNo][channelNo]){
                    // error;
                }
                banks[bankNo][channelNo] = new Channel(channelData);
                break;
            case 'MC0':
                selectedMemoryBankNo = dataArray[i][1];
                selectedMemoryChannelNo = dataArray[i][2];
                break;
            case 'MC9':
                break;
            default:
            }
        }
    }

    // Ensure all banks have exactly 50 channels (fill with empty channels if needed)
    if (fileType === SD_BACKUP) {
        for (let bankNo = 0; bankNo < MEMORY_BANK_NUM; bankNo++) {
            if (!banks[bankNo]) {
                banks[bankNo] = new Array(MEMORY_CHANNEL_NUM);
            }
            // Fill any missing channels with empty Channel objects
            for (let chNo = 0; chNo < MEMORY_CHANNEL_NUM; chNo++) {
                if (!banks[bankNo][chNo]) {
                    banks[bankNo][chNo] = new Channel();
                }
            }
        }
    }

    return new MemoryData(fileType, model, blockType, version, registeredAt, selectedMemoryBankNo, selectedMemoryChannelNo, banks);
}
function parseBankNamesFromData( dataArray ){
    // Parse membk.csv format to extract bank names
    let bankNames = new Array(MEMORY_BANK_NUM);
    // Initialize with empty names
    for (let i = 0; i < MEMORY_BANK_NUM; i++) {
        bankNames[i] = '            '; // 12 spaces
    }

    for (let i = 0; i < dataArray.length; i++) {
        if (dataArray[i][0] === 'MB1') {
            let bankNo = Number(dataArray[i][1]);
            let bankName = dataArray[i][6] || '            ';
            bankNames[bankNo] = bankName;
        }
    }
    return bankNames;
}
function showErrorPopup(message){
    $('#fn-error-message').text(message);
    $('#fn-error').popup('open');
}
function readFile(fileElement){
    return new Promise(
        function( resolv, reject ){
            fileElement.parse({
                config: {
                    delimiter: '',
                    header: false,
                    dynamicTyping: false,
                    skipEmptyLines: true,
                    preview: 0,
                    step: undefined,
                    encoding: 'Shift-JIS',
                    worker: false,
                    comments: false,
                    complete: function(results){
                        if (results && results.errors){
                            if (results.errors){
                                errorCount = results.errors.length;
                                firstError = results.errors[0];
                            }
                            if (results.data && results.data.length > 0){
                                rowCount = results.data.length;
                            }
//                            console.log(results.data);
                            resolv(results.data);
                        }
                    },
                    error: function(error, file){
//                        console.log('ERROR:', err, file);
                    },
                    download: false
                },
                before: function(file, inputElem){
//                    console.log('Parsing file...', file);
                },
                error: function(){
//                    console.log('error has occured.');
                },
                complete: function(res){
//                    console.log('Done with all files');
                }
            });
        });
};

function jsonToCsv(model, filename){
    // Save memory channel file
    let csv = Papa.unparse( currentMemoryData.toCSVData(model));
    let javascriptCharCodeArray = csv.split('').map(
        function(value, index, array){
            return value.charCodeAt(0);
        });
    let convertSJISCodeArray = Encoding.convert(javascriptCharCodeArray, 'SIJIS', 'UNICODE');
    let blob = new Blob([new Uint8Array(convertSJISCodeArray)], {'type': 'text/csv'});
    let blobURL = window.URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.download = filename;
    a.href = blobURL;
    a.dataset.downloadurl = ['text/csv', a.download, a.href].join(':');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Also save membk.csv file if this is an SD-BACKUP file
    if (currentMemoryData.fileType === SD_BACKUP) {
        let membkCsv = Papa.unparse( currentMemoryData.toMemBankCSVData(model));
        let membkCharCodeArray = membkCsv.split('').map(
            function(value, index, array){
                return value.charCodeAt(0);
            });
        let membkSJISCodeArray = Encoding.convert(membkCharCodeArray, 'SIJIS', 'UNICODE');
        let membkBlob = new Blob([new Uint8Array(membkSJISCodeArray)], {'type': 'text/csv'});
        let membkBlobURL = window.URL.createObjectURL(membkBlob);
        let membkLink = document.createElement('a');
        membkLink.download = 'membk.csv';
        membkLink.href = membkBlobURL;
        membkLink.dataset.downloadurl = ['text/csv', membkLink.download, membkLink.href].join(':');
        document.body.appendChild(membkLink);
        membkLink.click();
        document.body.removeChild(membkLink);
    }
}
function newMemoryData(model, fileType){
    let registeredDate = new Date;
    let registeredDateStr = `${registeredDate.getFullYear()}/${paddingZero(registeredDate.getMonth() + 1)}/${paddingZero(registeredDate.getDate())} ${paddingZero(registeredDate.getHours())}:${paddingZero(registeredDate.getMinutes())}:${paddingZero(registeredDate.getSeconds())}`;
    let version = '';
    let banks = new Array();
    let bankNum = ( fileType == SD_BACKUP ? MEMORY_BANK_NUM : 1 );
    for( let bank_i = 0; bank_i < bankNum; bank_i ++){
        let bank = new Array();
        for( let channel_i = 0; channel_i < MEMORY_CHANNEL_NUM; channel_i++){
            bank[channel_i] = new Channel();
        }
        banks[bank_i] = bank;
    }
    if( model == MODEL.AR_DV10.id ){
        version = '1803E';
    }else if( model == MODEL.AR_DV1.id ){
        version = '1610B';
    }else{
        vestion = '1610B';
    }
    return new MemoryData(fileType, model, 'MEM CH', version, registeredDateStr, '00', '00', banks);
}
function getSelectedChannel(){
    let selected = new Array;
    $('input[name="line_selected"]:checked').map(
        function(){
            selected.push($(this).attr('id'));
        });
    return selected;
}
function selectFrequencyFrom(selectValue){
    if( selectValue == 'frequency-list-file' ){
        $('#p-from-input').hide();
        $('#p-from-frequency-list-file').show();
    }else{
        $('#p-from-input').show();
        $('#p-from-frequency-list-file').hide();
    }
}
function multipleDataCreateCheck(){
    let errorFlg = false;
    $('#p-template-file-error').text('');
    $('#p-frequency-list-file-error').text('');
    $('#p-start-frequency-error').text('');
    $('#p-step-frequency-error').text('');
    $('#p-number-of-additional-channels-error').text('');
    if( !$('#p-template-file')[0].files[0] ){
        errorFlg = true;
        $('#p-template-file-error').text('Please select template file.');
    }
    switch( $('#p-multiple-data-create-frequency-from').val()){
    case 'frequency-list-file':
        if( !$('#p-frequency-list-file')[0].files[0] ){
            errorFlg = true;
            $('#p-frequency-list-file-error').text('Please select frequency list file.');
        }
        break;
    case 'frequency-input':
        if(!$('#p-start-frequency').val() || isNaN($('#p-start-frequency').val()) ){
            errorFlg = true;
            $('#p-start-frequency-error').text('Please input Start frequency.');
        }
        if(!$('#p-step-frequency').val() || isNaN($('#p-step-frequency').val()) ){
            errorFlg = true;
            $('#p-step-frequency-error').text('Please input Step frequency.');
        }
        if(!$('#p-number-of-additional-channels').val() || isNaN($('#p-number-of-additional-channels').val()) ){
            errorFlg = true;
            $('#p-number-of-additional-channels-error').text('Please input Number of additional channels.');
        }
        break;
    default:
        errorFlg = true;
    }
    return errorFlg;
}
function getDotPosition(value){
    let dotPosition = 0;
    if(value.lastIndexOf('.') != -1){
        dotPosition = (value.length - 1) - value.lastIndexOf('.');
    }
    return dotPosition;
}
function calcFrequency(startValue, additionalValue){
    let floatStartValue = parseFloat(startValue);
    let floatAdditionalValue = parseFloat(additionalValue);

    let startValueDotPosition = getDotPosition(startValue);
    let additionalValueDotPosition = getDotPosition(additionalValue);

    let max = Math.max(startValueDotPosition, additionalValueDotPosition);

    let intStartValue = parseInt((floatStartValue.toFixed(max) + '').replace('.', ''));
    let intAdditionalValue = parseInt((floatAdditionalValue.toFixed(max) + '').replace('.', ''));

    let power = Math.pow(10, max);

    return ( intStartValue + intAdditionalValue ) / power;
}
function multipleDataCreate(){
    if( $('#p-multiple-data-create-frequency-from').val() == 'frequency-input' ){
        frequencyList = new Array;
        let stepDotPosition = getDotPosition($('#p-step-frequency').val());
        let intStepValue = parseInt((parseFloat($('#p-step-frequency').val()).toFixed(stepDotPosition) + '').replace('.', ''));
        let power = Math.pow(10, stepDotPosition);
        for(let i = 0;i <  Number($('#p-number-of-additional-channels').val());i++){
            let additionalValue = intStepValue * i / power;
            let frequency = calcFrequency($('#p-start-frequency').val(),
                                          String(additionalValue));
            let line = new Array();
            line.push(String(frequency));
            frequencyList.push(line);
        }
    }
    let bankNo = $('#select-bank').val();
    let work = currentMemoryData.getBankChannels(bankNo).slice(0);
    for(let i = 0;i < frequencyList.length; i++){
        if( insertPoint + i == MEMORY_CHANNEL_NUM ){
            return -3;
        }
        if( work[insertPoint + i].channelRegistedFlg != '0' ){
            return -1;
        }
        if( !frequencyList[i][0] || isNaN(frequencyList[i][0]) ){
            return -2;
        }
        let channel = new Channel(templateData.getChannel(0, 0).data.slice(0));
        channel.receiveFrequency = frequencyList[i][0];
        if( frequencyList[i][1] ){
            channel.memoryTag = frequencyList[i][1].replace(MEMORY_TAG_REG,'').substr(0, 12);
        }
        work[insertPoint + i] = channel;
    }
    currentMemoryData._banks[bankNo] = work;
    return 0;
}
function defaultSaveFileName(){
    let date = new Date();
    let prefix = '';
    if( currentMemoryData.fileType == TEMPLATE_FILE ){
        prefix  = TEMPLATE_FILE_PREFIX;
    }else{
        prefix = MEMORY_CHANNEL_FILE_PREFIX;
    }
    return `${prefix}${String(date.getFullYear()).substr(2,2)}${paddingZero( date.getMonth() + 1 )}${paddingZero( date.getDate() )}.csv`;
}
function isValidSaveFilename(){
    let filename = $('#p-save-filename').val().replace(/\.csv/,'');
    if( $('#p-save-filename').val().length == 0 ){
        $('#p-save-filename').val(defaultSaveFileName());
    }
    if( filename.length > 8 ){
        $('#p-save-filename-error').text('File name is too long.')
        return false;
    }else{
        return true;
    }
}
/** main **/
$(document).on('pagecreate',
               function(e, d){
                   $('.version').text(`Version ${VERSION}`);
               });
$(document).on('change', 'select#select-bank',
               function(){
                   setList($(this).val());
                   // Update bank name input field
                   if (currentMemoryData && currentMemoryData.fileType == SD_BACKUP) {
                       let bankNo = $(this).val();
                       let bankName = currentMemoryData.getBankName(bankNo);
                       $('#bank-name-input').val(bankName);
                   }
});
$(document).on('input', '#bank-name-input',
               function(){
                   // Save bank name as user types
                   if (currentMemoryData && currentMemoryData.fileType == SD_BACKUP) {
                       let bankNo = parseInt($('#select-bank').val());
                       let bankName = $(this).val();
                       currentMemoryData.setBankName(bankNo, bankName);

                       // Update the dropdown option text to reflect the new name
                       let displayText = paddingZero(bankNo);
                       if (bankName && bankName.trim() !== '') {
                           displayText += ' - ' + bankName;
                       }
                       $(`#select-bank option[value="${bankNo}"]`).text(displayText);
                       $('#select-bank').selectmenu('refresh');
                   }
});
$(document).on('click', '#import-bank-names-btn',
               function(){
                   $('#membk-file-select').click();
               });
$(document).on('change', '#membk-file-select',
               function(event){
                   const file = event.target.files[0];
                   if (!file) return;

                   const reader = new FileReader();
                   reader.onload = function(e) {
                       const csvData = e.target.result;

                       // Parse CSV using PapaParse with Shift-JIS encoding
                       const codes = new Uint8Array(csvData);
                       const encoding_data = Encoding.convert(codes, {
                           to: 'UNICODE',
                           from: 'SJIS',
                           type: 'string'
                       });

                       Papa.parse(encoding_data, {
                           complete: function(results) {
                               try {
                                   // Parse bank names from membk.csv
                                   const bankNames = parseBankNamesFromData(results.data);

                                   // Apply bank names to current memory data
                                   if (currentMemoryData && currentMemoryData.fileType == SD_BACKUP) {
                                       currentMemoryData._bankNames = bankNames;

                                       // Update all dropdown options with new bank names
                                       for (let i = 0; i < MEMORY_BANK_NUM; i++) {
                                           let bankName = currentMemoryData.getBankName(i);
                                           let displayText = paddingZero(i);
                                           if (bankName && bankName.trim() !== '') {
                                               displayText += ' - ' + bankName;
                                           }
                                           $(`#select-bank option[value="${i}"]`).text(displayText);
                                       }
                                       $('#select-bank').selectmenu('refresh');

                                       // Update current bank name display
                                       let currentBankNo = $('#select-bank').val();
                                       let bankName = currentMemoryData.getBankName(currentBankNo);
                                       $('#bank-name-input').val(bankName);

                                       // Show success message
                                       $('#fn-info-message').text('Bank names imported successfully from membk.csv');
                                       $('#fn-info').popup('open');
                                   }
                               } catch (error) {
                                   showErrorPopup('Error reading membk.csv: ' + error.message);
                                   console.error('membk.csv read error:', error);
                               }
                           },
                           error: function(error) {
                               showErrorPopup('Error parsing membk.csv: ' + error.message);
                           }
                       });
                   };
                   reader.readAsArrayBuffer(file);

                   // Reset file input so the same file can be selected again
                   $(this).val('');
               });
/** Inline title editing **/
$(document).on('input', '.title-input',
               function(){
                   // Save title as user types
                   let channelNo = parseInt($(this).data('channel'));
                   let bankNo = $('#select-bank').val();
                   let newTitle = $(this).val();
                   let channel = currentMemoryData.getChannel(bankNo, channelNo);
                   if (channel) {
                       channel.memoryTag = newTitle;
                   }
               });
$(document).on('click', '#open-file-btn',
               function(){
                   $('#file-select').click();
               });
$(document).on('change', '#file-select',
               function(){
                   readFile($(this)).then(
                       function(readData){
                           $('#file-name').text($('#file-select').prop('files')[0].name);
                           $('#file-model').text('');
                           $('#file-version').text('');
                           $('#file-registered-at').text('');
                           currentMemoryData = readDataToObject(readData);
                           setEditMode(currentMemoryData.fileType);
                       },
                       function(error){
                           showErrorPopup('An error occurred while reading the file.');
                           return false;
                       });
               });
$(document).on('click', '#save-file-btn',
               function(){
                   $('#p-save-filename-error').text('');
                   $('#p-save-filename').val(defaultSaveFileName());
                   $('#model').val(currentMemoryData.model).selectmenu('refresh');
                   $('#p-save-file').popup('open');
               });
$(document).on('click', '.channel_row',
               function(){
                   currentMemoryBankNo = $('#select-bank').val();
                   currentMemoryChannelNo = Number($(this).attr('id').split('_')[1]);
                   current_channel = currentMemoryData.getChannel(currentMemoryBankNo, currentMemoryChannelNo);
               });
$(document).on('pagebeforeshow', '#page-detail',
               function(){
                   if ( current_channel ){
                       setDetail();
                   }else{
                       $.mobile.changePage('#page-list');
                   }
               });
$(document).on('click', '#fn-select-all-btn',
               function(){
                   // Only select registered (non-empty) channels
                   let bankNo = $('#select-bank').val();
                   let memoryChannels = currentMemoryData.getBankChannels(bankNo);
                   for (let i = 0; i < memoryChannels.length; i++) {
                       if (memoryChannels[i].channelRegistedFlg == '1') {
                           $(`#line_selected_${i}`).prop('checked', true);
                       }
                   }
               });
$(document).on('click', '#fn-deselect-all-btn',
               function(){
                   $('input[name="line_selected"]').prop('checked', false);
               });
$(document).on('click', '#fn-clear-btn',
               function(){
                   let selected = getSelectedChannel();
                   if ( selected.length == 0 ){
                       showErrorPopup('Please select channels to clear.');
                   }else{
                       let bankNo = $('#select-bank').val();
                       for(let i = 0; i < selected.length; i++){
                           let channelNo = Number(selected[i].split('_')[2]);
                           currentMemoryData.clearChannel(bankNo, channelNo);
                           updateLine(channelNo);
                           $(`#${selected[i]}`).prop('checked', false);
                       }
                   }
               });
$(document).on('click', '#fn-remove-btn',
               function(){
                   let selected = getSelectedChannel();
                   if ( selected.length == 0 ){
                       showErrorPopup('Please select channels to remove.');
                   }else{
                       let removeChannels = new Array;
                       let bankNo = $('#select-bank').val();
                       for(let i = 0; i < selected.length; i++){
                           removeChannels.push(Number(selected[i].split('_')[2]));
                       }
                       currentMemoryData.removeChannel(bankNo, removeChannels);
                       for(let i = 0; i < MEMORY_CHANNEL_NUM; i++){
                           updateLine(i);
                           $(`#line_selected_${i}`).prop('checked', false);
                       }
                   }
               });
$(document).on('click', '#fn-cut-btn',
               function(){
                   let selected = getSelectedChannel();
                   if ( selected.length == 0 ){
                       showErrorPopup('Please select channels to cut.');
                   }else{
                       selectedChannels = new Array();
                       selectedFunction = 'CUT';
                       let multipleSelected = false;
                       // sort!!
                       for(let i = 0; i < selected.length; i++){
                           if( i != 0 && Number(selected[i].split('_')[2]) != selectedChannels[i - 1][1] + 1 ){
                               multipleSelected = true;
                               break;
                           }
                           selectedChannels.push([Number($('#select-bank').val()), Number(selected[i].split('_')[2])]);
                       }
                       if ( multipleSelected ){
                           selectedChannels = null;
                           selectedFunction = null;
                           showErrorPopup('This function can not be executed for multiple selection ranges.Please select one range and try again.');
                       }else{
                           $('#fn-info-message').text('Channels has been selected.');
                           $('#fn-info').popup('open');
                           for(let i = 0; i < selected.length; i++){
                               $(`#line_selected_${selectedChannels[i][1]}`).prop('checked', false);
                           }

                       }
                   }
               });
$(document).on('click', '#fn-copy-btn',
               function(){
                   let selected = getSelectedChannel();
                   if ( selected.length == 0 ){
                       showErrorPopup('Please select channels to copy.');
                   }else{
                       selectedChannels = new Array();
                       selectedFunction = 'COPY';
                       let multipleSelected = false;
                       // sort!!
                       for(let i = 0; i < selected.length; i++){
                           if( i != 0 && Number(selected[i].split('_')[2]) != selectedChannels[i - 1][1] + 1 ){
                               multipleSelected = true;
                               break;
                           }
                           selectedChannels.push([Number($('#select-bank').val()), Number(selected[i].split('_')[2])]);
                       }
                       if ( multipleSelected ){
                           selectedChannels = null;
                           selectedFunction = null;
                           showErrorPopup('This function can not be executed for multiple selection ranges.Please select one range and try again.');
                       }else{
                           $('#fn-info-message').text('Channels has been selected.');
                           $('#fn-info').popup('open');
                           for(let i = 0; i < selected.length; i++){
                               $(`#line_selected_${selectedChannels[i][1]}`).prop('checked', false);
                           }
                       }
                   }
               });
$(document).on('click', '#fn-insert-btn',
               function(){
                   let selected = getSelectedChannel();
                   if ( selected.length == 0 ){
                       showErrorPopup('Please select channels to insert.');
                   }else{
                       let insertDestination = null;
                       for(let i = 0; i < selected.length; i++){
                           if( insertDestination == null){
                               insertDestination = Number(selected[i].split('_')[2]);
                           }
                           if( insertDestination > Number(selected[i].split('_')[2]) ){
                               insertDestination = Number(selected[i].split('_')[2]);
                           }
                       }
                       if( selectedFunction == 'CUT' ){
                           if ( !currentMemoryData.cutInsertChannel($('#select-bank').val(),
                                                                    selectedChannels,
                                                                    insertDestination)){
                               showErrorPopup('The maximum number of channels that can be registered in the currently selected bank is exceeded.');
                               selectedChannels = null;
                               selectedFunction = null;
                               return;
                           }
                              }else if( selectedFunction == 'COPY' ){
                           if( !currentMemoryData.copyInsertChannel($('#select-bank').val(),
                                                                    selectedChannels,
                                                                    insertDestination)){
                               showErrorPopup('The maximum number of channels that can be registered in the currently selected bank is exceeded.');
                               selectedChannels = null;
                               selectedFunction = null;
                               return;
                           }
                       }else{
                           return;
                       }
                       for(let i = 0; i < MEMORY_CHANNEL_NUM; i++){
                           updateLine(i);
                           $(`#line_selected_${i}`).prop('checked', false);
                       }
                       selectedChannels = null;
                       selectedFunction = null;
                   }
               });
$(document).on('click', '#fn-moveup-btn',
               function(){
                   let selected = getSelectedChannel();
                   if ( selected.length == 0 ){
                       showErrorPopup('Please select channels to move up.');
                   }else{
                       for(let i = 0; i < selected.length; i++){
                           currentMemoryData.moveUpChannel($('#select-bank').val(), Number(selected[i].split('_')[2]));
                       }
                       for(let i = 0; i < MEMORY_CHANNEL_NUM; i++){
                           updateLine(i);
                           $(`#line_selected_${i}`).prop('checked', false);
                       }
                       for(let i = 0; i < selected.length; i++){
                           if ( Number(selected[i].split('_')[2]) > -1 ){
                               $(`#line_selected_${Number(selected[i].split('_')[2]) - 1}`).prop('checked', true);
                           }
                       }

                   }
               });
$(document).on('click', '#fn-movedown-btn',
               function(){
                   let selected = getSelectedChannel();
                   if ( selected.length == 0 ){
                       showErrorPopup('Please select channels to move down.');
                   }else{
                       for(let i = selected.length - 1; i >= 0; i--){
                           currentMemoryData.moveDownChannel($('#select-bank').val(), Number(selected[i].split('_')[2]));
                       }
                       for(let i = 0; i < MEMORY_CHANNEL_NUM; i++){
                           updateLine(i);
                           $(`#line_selected_${i}`).prop('checked', false);
                       }
                       for(let i = 0; i < selected.length; i++){
                           if ( Number(selected[i].split('_')[2]) < MEMORY_CHANNEL_NUM ){
                               $(`#line_selected_${Number(selected[i].split('_')[2]) + 1}`).prop('checked', true);
                           }
                       }

                   }
               });
$(document).on('click', '#fn-sort-btn',
               function(){
                   $('#p-sort-options').empty();
                   let sortOptions = new Array;
                   if ( currentMemoryData ){
                       if ( currentMemoryData.fileType == SD_BACKUP ){
                           sortOptions = [{ priority: 1, row: 'Frequency', id: 'frequency'}, { priority: 2, row: 'Mode', id: 'mode' }];
                       }else{
                           sortOptions = [{ priority: 1, row: 'Mode', id: 'mode'}];
                       }
                       for(let i = 0;i < sortOptions.length; i++){
                           $('#p-sort-options').append($('<tr>').append(
                               $('<td>', { text: sortOptions[i].priority }),
                               $('<td>', { text: sortOptions[i].row }),
                               $('<td>').append(
                                   $('<select>', { id: `${sortOptions[i].id}-sort`} ).append(
                                       $('<option>', { text: 'ASC', value: 'ASC' }),
                                       $('<option>', { text: 'DESC', value: 'DESC' })
                                   )
                               )
                           ));
                           $(`#${sortOptions[i].id}-sort`).selectmenu();
                       }
                       $('#p-sort').popup('open');
                   }
               });
$(document).on('click', '#fn-multiple-data-create-btn',
               function(){
                   let selected = getSelectedChannel();
                   if ( selected.length == 0 ){
                       showErrorPopup('Please select channels to create point.');
                   }else{
                       insertPoint = null;
                       for(let i = 0; i < selected.length; i++){
                           if(!insertPoint || insertPoint > Number(selected[i].split('_')[2]) ){
                               insertPoint = Number(selected[i].split('_')[2]);
                           }
                       }
                       $('#insert-point').text(`No.${paddingZero(insertPoint)}`);
                       // crear pop up error
                       multipleDataCreateError = null;
                       $('#p-multiple-data-create-frequency-from').val('frequency-list-file').selectmenu('refresh');
                       selectFrequencyFrom($('#p-multiple-data-create-frequency-from').val());
                       $('#p-number-of-additional-channels').val('').textinput('refresh');
                       $('#p-start-frequency').val('').textinput('refresh');
                       $('#p-step-frequency').val('').textinput('refresh');
                       $('#multiple_data_create').popup('open');
                   }
               });
/* sort */
$(document).on('click', '#sort-cancel-btn',
               function(){
                   $('#p-sort').popup('close');
               });
$(document).on('click', '#execute-sort-btn',
               function(){
                   let sortParam = [$('#frequency-sort').val(), $('#mode-sort').val()];
                   currentMemoryData.sortChannel($('#select-bank').val(), sortParam);
                   for(let i = 0; i < MEMORY_CHANNEL_NUM; i++){
                       updateLine(i);
                   }
                   $('#p-sort').popup('close');
               });
/** muliple data create **/
$(document).on('click', '#multiple_data_create_cancel',
               function(){
                   $('#p-template-file-error').text('');
                   $('#p-frequency-list-file-error').text('');
                   $('#p-start-frequency-error').text('');
                   $('#p-step-frequency-error').text('');
                   $('#p-number-of-additional-channels-error').text('');

                   for(let i = 0; i < MEMORY_CHANNEL_NUM; i++){
                       $(`#line_selected_${i}`).prop('checked', false);
                   }
                   $('#multiple_data_create').popup('close');
               });
$(document).on('change', '#p-multiple-data-create-frequency-from',
               function(){
                   selectFrequencyFrom($(this).val());
               });
$(document).on('change', '#p-template-file',
               function(){
                   readFile($(this)).then(
                       function(readData){
                           templateData = readDataToObject(readData);
                       },
                       function(error){
                           showErrorPopup('An error occurred while reading the template file.');
                           return false;
                       });
               });
$(document).on('change', '#p-frequency-list-file',
               function(){
                    readFile($(this)).then(
                       function(readData){
                           frequencyList = new Array;
                           for(let i = 0; i < readData.length; i++){
                               frequencyList.push(readData[i]);
                            }
                       },
                       function(error){
                           showErrorPopup('An error occurred while reading the frequency list file.');
                           return false;
                       });
               });
$(document).on('click', '#p-multiple-data-create-btn',
               function(){
                   if( !multipleDataCreateCheck() ){
                       let result = multipleDataCreate();
                       if( result == 0 ){
                           for(let i = 0; i < MEMORY_CHANNEL_NUM; i++){
                               updateLine(i);
                               $(`#line_selected_${i}`).prop('checked', false);
                           }
                       }else{
                           multipleDataCreateError = result;
                       }
                       for(let i = 0; i < MEMORY_CHANNEL_NUM; i++){
                           $(`#line_selected_${i}`).prop('checked', false);
                       }
                       $('#multiple_data_create').popup('close');
                   };
               });
$(document).on('popupafterclose', '#multiple_data_create',
               function(){
                   switch( multipleDataCreateError ){
                   case -1:
                       showErrorPopup('There are already registered channels in the creation range.');
                       break;
                   case -2:
                       showErrorPopup('Frequency invalid.');
                       break;
                   case -3:
                       showErrorPopup('The channel you are trying to register exceeds the size of the bank.');
                       break;
                   default:
                       //
                   }
               });
/** save file **/
$(document).on('click', '#export_csv',
               function(){
                   if( isValidSaveFilename() ){
                       $('#p-save-file').popup('close');
                       jsonToCsv($('#model').val(), $('#p-save-filename').val().replace(/\.csv/,'') + '.csv');
                   }
               });
$(document).on('click', '#save_cancel',
               function(){
                   $('#p-save-file').popup('close');
               });
/** new file **/
$(document).on('click', '#create-file',
               function(){
                   switch( $('#new-file-type').val() ){
                   case 'memory-channel-file':
                       currentMemoryData = newMemoryData($('#new-file-model').val(), SD_BACKUP);
                       setEditMode(SD_BACKUP);
                       $('#file-name').text('(New File)');
                       $('#new_file').popup('close');
                       break;
                   case 'template-file':
                       currentMemoryData = newMemoryData($('#new-file-model').val(), TEMPLATE_FILE);
                       setEditMode(TEMPLATE_FILE);
                       $('#file-name').text('(New Template File)');
                       $('#new_file').popup('close');
                       break;
                   default:
                       currentMemoryData = newMemoryData($('#new-file-model').val(), SD_BACKUP);
                       setEditMode(SD_BACKUP);
                       $('#file-name').text('(New File)');
                       $('#new_file').popup('close');
                       break;
                   }
               });
$(document).on('click', '#new-cancel',
               function(){
                   $('#new_file').popup('close');
               });
/** error**/
$(document).on('click', '#fn-error-close',
               function(){
                   $('#fn-error').popup('close');
               });
/** info **/
$(document).on('click', '#fn-info-close',
               function(){
                   $('#fn-info').popup('close');
               });

/** Import channels from Radio Reference UK export **/
let importSourceData = null;

$(document).on('change', '#import-source-file',
               function(event){
                   const file = event.target.files[0];
                   if (!file) return;

                   $('#import-source-file-error').text('');

                   // Read the import source file
                   const reader = new FileReader();
                   reader.onload = function(e) {
                       const csvData = e.target.result;

                       // Parse CSV using PapaParse with Shift-JIS encoding
                       const codes = new Uint8Array(csvData);
                       const encoding_data = Encoding.convert(codes, {
                           to: 'UNICODE',
                           from: 'SJIS',
                           type: 'string'
                       });

                       Papa.parse(encoding_data, {
                           complete: function(results) {
                               try {
                                   importSourceData = readDataToObject(results.data);

                                   if (!importSourceData || importSourceData.fileType !== SD_BACKUP) {
                                       $('#import-source-file-error').text('Invalid file format. Please select an SD-BACKUP file.');
                                       return;
                                   }

                                   // Populate target bank dropdown
                                   $('#import-target-bank').empty();
                                   for (let i = 0; i < MEMORY_BANK_NUM; i++) {
                                       $('#import-target-bank').append(
                                           $('<option>', { value: i, text: 'Bank ' + paddingZero(i) })
                                       );
                                   }

                                   // Set current bank as default
                                   const currentBank = parseInt($('#select-bank').val() || 0);
                                   $('#import-target-bank').val(currentBank);

                                   // Display all channels from import file
                                   displayImportChannels();

                                   $('#import-channel-selection').show();
                                   $('#import-execute-btn').show();
                               } catch (error) {
                                   $('#import-source-file-error').text('Error reading file: ' + error.message);
                                   console.error('Import file read error:', error);
                               }
                           },
                           error: function(error) {
                               $('#import-source-file-error').text('Error parsing CSV: ' + error.message);
                           }
                       });
                   };
                   reader.readAsArrayBuffer(file);
               });

function displayImportChannels() {
    const tbody = $('#import-channels-tbody');
    tbody.empty();

    if (!importSourceData) return;

    const deduplicate = $('#import-deduplicate').prop('checked');
    const seenFrequencies = new Set();

    // Iterate through all banks and channels
    for (let bankNo = 0; bankNo < MEMORY_BANK_NUM; bankNo++) {
        const channels = importSourceData.getBankChannels(bankNo);
        for (let chNo = 0; chNo < channels.length; chNo++) {
            const channel = channels[chNo];

            // Only show registered channels (skip empty ones)
            if (channel.channelRegistedFlg == '1') {
                const frequency = channel.receiveFrequency;

                // Skip if deduplicating and we've already seen this frequency
                if (deduplicate && seenFrequencies.has(frequency)) {
                    continue;
                }

                // Mark this frequency as seen
                if (deduplicate) {
                    seenFrequencies.add(frequency);
                }

                const row = $('<tr>');

                const checkbox = $('<input>', {
                    type: 'checkbox',
                    class: 'import-channel-checkbox',
                    'data-bank': bankNo,
                    'data-channel': chNo
                });

                row.append($('<td>').append(checkbox));
                row.append($('<td>', { text: paddingZero(bankNo) }));
                row.append($('<td>', { text: paddingZero(chNo) }));
                row.append($('<td>', { text: frequency }));
                row.append($('<td>', { text: channel.memoryTag }));
                row.append($('<td>', { text: channel.modeDescription() }));

                tbody.append(row);
            }
        }
    }

    // Update counter after displaying channels
    updateImportSelectedCount();
}

$(document).on('change', '#import-deduplicate',
               function(){
                   // Refresh the channel list when deduplicate setting changes
                   displayImportChannels();
               });

function updateImportSelectedCount() {
    const count = $('.import-channel-checkbox:checked').length;
    $('#import-selected-count').text(`(${count} selected)`);
}

$(document).on('change', '#import-select-all',
               function(){
                   const checked = $(this).prop('checked');
                   $('.import-channel-checkbox').prop('checked', checked);
                   updateImportSelectedCount();
               });

$(document).on('change', '.import-channel-checkbox',
               function(){
                   updateImportSelectedCount();
               });

$(document).on('click', '#import-execute-btn',
               function(){
                   const targetBank = parseInt($('#import-target-bank').val());
                   const selectedChannels = [];

                   // Collect selected channels
                   $('.import-channel-checkbox:checked').each(function() {
                       const bankNo = parseInt($(this).data('bank'));
                       const chNo = parseInt($(this).data('channel'));
                       const channel = importSourceData.getBankChannels(bankNo)[chNo];
                       selectedChannels.push(channel);
                   });

                   if (selectedChannels.length === 0) {
                       $('#import-source-file-error').text('Please select at least one channel to import.');
                       return;
                   }

                   // Find the first available position in target bank
                   const targetBankChannels = currentMemoryData.getBankChannels(targetBank);
                   let insertPosition = 0;

                   // Find first empty slot
                   for (let i = 0; i < targetBankChannels.length; i++) {
                       if (targetBankChannels[i].channelRegistedFlg != '1') {
                           insertPosition = i;
                           break;
                       }
                       insertPosition = i + 1;
                   }

                   // Check if there's enough space
                   if (insertPosition + selectedChannels.length > MEMORY_CHANNEL_NUM) {
                       const available = MEMORY_CHANNEL_NUM - insertPosition;
                       $('#import-source-file-error').text(
                           `Not enough space in target bank. Available slots: ${available}, Selected channels: ${selectedChannels.length}`
                       );
                       return;
                   }

                   // Import channels
                   for (let i = 0; i < selectedChannels.length; i++) {
                       const sourceChannel = selectedChannels[i];
                       const targetChannel = targetBankChannels[insertPosition + i];

                       // Copy all channel properties
                       targetChannel.copyFrom(sourceChannel);
                       // Update bank and channel numbers in the data array
                       targetChannel.data[MC.MEMORY_BANK] = paddingZero(targetBank);
                       targetChannel.data[MC.MEMORY_CHANNEL] = paddingZero(insertPosition + i);
                   }

                   // Refresh the display
                   setList(targetBank);
                   $('#select-bank').val(targetBank).selectmenu('refresh');

                   // Close the popup
                   $('#import_channels').popup('close');

                   // Reset the form
                   $('#import-source-file').val('');
                   $('#import-channel-selection').hide();
                   $('#import-execute-btn').hide();
                   $('#import-source-file-error').text('');
                   $('#import-selected-count').text('(0 selected)');
                   importSourceData = null;

                   // Show success message
                   $('#fn-info-message').text(`Successfully imported ${selectedChannels.length} channel(s) to Bank ${paddingZero(targetBank)}`);
                   $('#fn-info').popup('open');
               });

$(document).on('click', '#import-cancel-btn',
               function(){
                   $('#import_channels').popup('close');
                   $('#import-source-file').val('');
                   $('#import-channel-selection').hide();
                   $('#import-execute-btn').hide();
                   $('#import-source-file-error').text('');
                   $('#import-selected-count').text('(0 selected)');
                   importSourceData = null;
               });
