$(function (){
		// define the table
		$results = $('#results');

		// when a selection is made, populate the appropriate table
		$('#submit').on('click', function(){
				
		var area = $('#CB').val();
		
		// get the boro name for api call from the CB number
		var apiBoro = ' ';
		var boroNum = area[0];
		switch(boroNum){
			case "1":
				apiBoro = 'man';
				break;
			case "2":
				apiBoro = 'brx';
				break;
			case "3":
				apiBoro = 'brk';
				break;
			case "4":
				apiBoro = 'qns';
				break;
			case "5":
				apiBoro = 'si';
				break;
			
		}
		
		// clear table and map, set the header rows
		var headerRow = '<thead>'
						+'<th>Address</th>'
						+'<th>Owner</th>'
						+'<th>BIN</th>'
						+'<th># of Jobs</th>'
						+'<th>Last Job Date</th>'
						+'</thead>';
		$results.empty();
		$results.append(headerRow);
		

		// set up the arrays to generate the table
		var entries = [];
			entryAddr = [];
			jobDetails = [];
			jobNumbers = [];
			jobNumCount = [];
			jobLatestDate = [];
			bblList = [];
			xCoord = [];
			yCoord = [];

			// set up dates
	var timeFrame = $('#timeFrame').val();
		time = '';
		today = new Date();
		thisYear = today.getFullYear();
		sevenDays = today - 1000 * 60 * 60 * 24 * 7;
		oneWeekAgo = new Date(sevenDays);
		thirtyDays = today - 1000 * 60 * 60 * 24 * 30;
		thirtyDaysAgo = new Date(thirtyDays);
					
	// function to get correct date format
	var formatDate = function(date){
		var dd = date.getDate();
		var mm = date.getMonth()+1; //January is 0!
		var yyyy = date.getFullYear();
	
		if(dd<10) {
			dd='0'+dd
		} 
		if(mm<10) {
			mm='0'+mm
		} 
		formattedDate = mm+'/'+dd+'/'+yyyy;
		return formattedDate;
	};
	// function to clean the date for selected timeframe
	// call on this function to get the timeframe as well
		if(timeFrame == "oneWeekAgo" || timeFrame == "thirtyDaysAgo"){
			var earliestDate = formatDate(today);
		}
		switch(timeFrame){
		case "oneWeekAgo":
			var latestDate = formatDate(oneWeekAgo);
			break;
		case "thirtyDaysAgo":
			var latestDate = formatDate(thirtyDaysAgo);
			break;
		// the following are weird, I have to figure them out
		case "2014":
			var latestDate = '01/01/2014';
				earliestDate = '12/31/2014';
			break;		
		case "2013":
			var latestDate = '01/01/2013';
				earliestDate = '12/31/2013';
			break;	
		default:
			alert("Timeframe not specified!");
			break;
		}
		var apiDate = "&$where=latest_action_date <= '"+earliestDate+"' AND latest_action_date >= '"+latestDate+"'";
	// now call on getTime() to get the date portion of the API url
		
// function to get permits, called at the end
var getPermitsFiled = function(){
	
	// generate API request URL
	// with date should look like this: 
	// https://data.cityofnewyork.us/resource/ic3t-wcy2.json?$order=:id DESC&$where=latest_action_date <= 'earliest_date' AND latest_action_date >= 'latest_date'
	// dates should be in mm/dd/yyyy format; date is a string
	// the final API request URL should look like this:
	// https://data.cityofnewyork.us/resource/ic3t-wcy2.json?$order=:id DESC&community___board='###'&$where=latest_action_date >= 'earliest_date' AND latest_action_date <= 'latest_date'
	var apiGet = "https://data.cityofnewyork.us/resource/ic3t-wcy2.json?$order=:id DESC&community___board='"+area+"'"+apiDate;
		
	//get JSON and populate rest of table
	$.getJSON(apiGet, function(data) {	
		// cycle through each item
		$.each(data, function(i, e){
		
			// set the variables first
			var bin = e.bin__;
				binURL = 'http://a810-bisweb.nyc.gov/bisweb/PropertyProfileOverviewServlet?bin='+bin;
				binLink = '<a href="'+binURL+'" target="_blank">'+bin+'</a>';
				
				block = e.block;
				lot0 = e.lot;
				lot = lot0.substring(1);
				borough = e.borough;
				boro = area[0];
				bbl = boro+block+lot;
				
				house = e.house__;
				street = e.street_name;
				city = e.city_;
				zip = e.zip;
				address = house+' '+street;
				
				jobNum = e.job__;
				docNum = e.doc__;
				jobStatus = e.job_status;
				jobType = e.job_type;
				jobDescrp = e.job_description;
				jobStatDescrp = e.job_status_descrp;
				jobLatestActionDate = e.latest_action_date;
				jobURL = 'http://a810-bisweb.nyc.gov/bisweb/JobsQueryByNumberServlet?passdocnumber='+docNum+'&passjobnumber='+jobNum;
				jobLink = '<a href="'+jobURL+'" target="_blank">'+jobNum+'</a>'

				// owners can be private or businesses; only non-private owner names should show
				// this function will display business names where applicable and "Private Owner" where appropriate
				var findOwnerType = function (){
				owner = e.owner_s_business_name;
					if(owner == "N/A" || owner == "NA" || owner == "NONE" || owner == "NOT APPLICABLE" || owner == "N/AS" || owner == "-" || owner == "."){
						return owner = '<p title="Private owner names are not displayed for privacy concerns." style= "margin:0px; color:red; cursor:help">Private Owner</p>';
					}
					
				};
				// call on the previous function
				findOwnerType();
				
			// get the location of the BIN in the 'entries' array
			var entryLocation = $.inArray(bin, entries);
			
			// function to add Job Numbers to array without duplicates
			var addJobs = function (jobNumber){
				if($.inArray(jobNumber, jobNumbers) == -1){ 
				jobNumbers.push(jobNumber);
				}
			};
			
			// style the data rows here
			var buildingLocation = '<tbody class="entry" id="'+bin+'">'
									+'<tr class="location">'
									+'<td class="add">'+address+'</td>'
									+'<td class="owner">'+owner+'</td>'
									+'<td class="bin">'+binLink+'</td>'
									+'<td class="count"><span class="count"></span></td>'
									+'<td class="latestDate"><span class="latestDate"></span></td>'+
									'</tr>';
			var locationDetail = '<tr class="locationDetail">'
								+'<td colspan="5"><b>BBL:</b> '+bbl+'</td>'
								+'</tr>';
			var jobDetail = '<tr class="detail">'
							+'<td colspan="5">'
							+'<div class="detail">'
							+'<p>'+jobLink+'</p>'
							+'<p>'+jobDescrp+'</p>'
							+'</div></td></tr>';
							
	// dealing with SOCRATA: now we have to make sure only the years that we need show up, since the query request is limited and weird
	if(timeFrame == "oneWeekAgo" && jobLatestActionDate.substring(6) == thisYear){
			// check whether BIN exists in array or not -- important, since all indexing relies on this conditional
			// if BIN does not exist in array
			if($.inArray(bin, entries) == -1){
				// add this BIN to array
				entries.push(bin);
		
				// add the entry to the array
				var firstEntry = buildingLocation + locationDetail + jobDetail;
				jobDetails.push(firstEntry);
				
				addJobs(jobNum);
				bblList.push(bbl);
				jobNumCount.push(1);
				entryAddr.push(address);
				jobLatestDate.push(jobLatestActionDate);
				
				}
			// if BIN does exist in array
			else{
				// get string in 'jobDetails' array, add new row, and update array
				var updateEntry = jobDetails[entryLocation]+jobDetail;
				
				jobDetails[entryLocation] = updateEntry;
				addJobs(jobNum);
				
				// increment the jobNumCount array
				var currentCount = jobNumCount[entryLocation];
				var updatedCount = currentCount + 1;
				jobNumCount[entryLocation] = updatedCount;
				};				
		}else if(timeFrame == "thirtyDaysAgo" && jobLatestActionDate.substring(6) == thisYear){
		// check whether BIN exists in array or not -- important, since all indexing relies on this conditional
			// if BIN does not exist in array
			if($.inArray(bin, entries) == -1){
				// add this BIN to array
				entries.push(bin);
		
				// add the entry to the array
				var firstEntry = buildingLocation + locationDetail + jobDetail;
				jobDetails.push(firstEntry);
				
				addJobs(jobNum);
				bblList.push(bbl);
				jobNumCount.push(1);
				entryAddr.push(address);
				jobLatestDate.push(jobLatestActionDate);
				
				}
			// if BIN does exist in array
			else{
				// get string in 'jobDetails' array, add new row, and update array
				var updateEntry = jobDetails[entryLocation]+jobDetail;
				
				jobDetails[entryLocation] = updateEntry;
				addJobs(jobNum);
				
				// increment the jobNumCount array
				var currentCount = jobNumCount[entryLocation];
				var updatedCount = currentCount + 1;
				jobNumCount[entryLocation] = updatedCount;
				};
		}else if(timeFrame == jobLatestActionDate.substring(6)){
		// check whether BIN exists in array or not -- important, since all indexing relies on this conditional
			// if BIN does not exist in array
			if($.inArray(bin, entries) == -1){
				// add this BIN to array
				entries.push(bin);
		
				// add the entry to the array
				var firstEntry = buildingLocation + locationDetail + jobDetail;
				jobDetails.push(firstEntry);
				
				addJobs(jobNum);
				bblList.push(bbl);
				jobNumCount.push(1);
				entryAddr.push(address);
				jobLatestDate.push(jobLatestActionDate);
				
				}
			// if BIN does exist in array
			else{
				// get string in 'jobDetails' array, add new row, and update array
				var updateEntry = jobDetails[entryLocation]+jobDetail;
				
				jobDetails[entryLocation] = updateEntry;
				addJobs(jobNum);
				
				// increment the jobNumCount array
				var currentCount = jobNumCount[entryLocation];
				var updatedCount = currentCount + 1;
				jobNumCount[entryLocation] = updatedCount;
				};
		};
		}); // .each row function ends
		
		// add the entries array to the table
		$results.append(jobDetails);		
	
		// put the jobNumCount value into the span 
		for (i = 0; i < entries.length; i++){
			var count = jobNumCount[i];
			$('span.count').eq(i).text(count);
		};	
		
		// put the latest job date into the span
		for (i = 0; i < entries.length; i++){
			var date = jobLatestDate[i];
			$('span.latestDate').eq(i).text(date);
		};	
		
		// hide details rows
		$('.location').nextUntil('.location').hide();		
	
	// function to get coordinates from the BBL list

		var getCoordinates = function(){
			
			// this is the function to get coordinates from CartoDB
			var sqlQuery = function(bbl, address){
						
				var sql_statement = 'SELECT x, y FROM ' + apiBoro + '_xywsg WHERE bbl='+bbl;
				var account = 'peterhunter';
				
				$.getJSON('http://'+account+'.cartodb.com/api/v2/sql/?q='+sql_statement, function(data) {
					$.each(data.rows, function(key, val) {
						var x = val.x;
						var y = val.y;
						// this will have to be changed to add to layer, but for now it is good enough
						var marker = L.marker([y, x]).addTo(map); 		// this is where I should make the layer
							marker.bindPopup("<b>Address:</b><br>"+address);
					});
				});
			};
			
			// this loops through the bblList array, carrying out the function on each item
			for(i=0; i<bblList.length; i++){
				var bbl = bblList[i];
					address = entryAddr[i];
				sqlQuery(bbl, address);
			};	
		};

//call getCoordinates from here
	getCoordinates();
	});
	// below here will fire asynchronously
};
// call getPermitsFiled beyond here
	getPermitsFiled();
	

});
// end onClick

	//expand selections
	$results.delegate('.location', 'click', function(){
			$(this).toggleClass('firstline_selected');
		   	$(this).nextUntil('tbody').slideToggle(100, function(){
			});
		});

	// if the getJSON request fails:
	$(document).ajaxError(function(){
		alert("The data source is unavailable! Please try again later!");
		return;
	}); 
});