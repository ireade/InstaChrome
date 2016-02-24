"use strict";

$(document).ready(function() {

	//Temprorary cache for data returned during search
	var data_cache;
	
	var cleanHashtag = function(tag) {
		if ( tag.indexOf("#") === -1 ) {
			// Display tag with # on front end
			$('input[type="text"]').val('#'+tag);
		}
		//remove #s and collapse whitespaces 
		tag = tag.replace(/(#+|\s+)/g,"");
		return tag;
	}



	// Number
	var n = 6;
	var items_start = 0;
	var items_end = n;


	var renderer = function(data) {

		var items = [];

		// 
		for (var i=items_start; i < items_end; i++) {

			if ( data.data[i] ) {
				items.push(data.data[i]);
			} else {
				$('.next').hide();
			}
			
		}

		// Setup Handlebars templating
		var source = $('#grams-template').html();
		var template = Handlebars.compile(source);
		var output = template( {Grams: items} );


		$('.loading').hide();

		if (data.data.length === 0) {
			// Show error messages if no images for this tag
			$('.message-error').show();
		} else {
			// Else, display the images in the template
			$("#grams").html(output).fadeIn();
		}

	};

	var request = function() {

		chrome.storage.local.get("tag", function(result) {

			var tag = cleanHashtag(result.tag);




			var requestUrl = 'https://api.instagram.com/v1/tags/'+tag+'/media/recent?access_token='+accessToken+'&callback=?';

			//var requestUrl = 'https://api.instagram.com/v1/users/studioofmode/media/recent/?access_token=22156862.1fb234f.2bdfa1f73084463cbf628b55878198f0&scope=public_content&callback=?';


			$.getJSON(requestUrl, {}, function(data) {

				//cache data so we don't need to make new requests everytime next / prev is clicked
				data_cache = data;
				//Render data
				renderer(data);

			});


		}); // end get local storage

	}; // end request

	
	// When users search
	$('#search').on('submit', function() {

		// Clear messages and any previous images, and show loading animation
		$('.grams-container').show();
		$('.message').hide();
		$("#grams").html("");
		$('.loading').show();
		$('.prev').hide();
		items_start = 0;
		items_end = n;

		var searchInput = $('#searchText').val();

		// Set the search text to local storage
		chrome.storage.local.set({"tag" : searchInput}, function(){
			request();
		});

		return false;
	})



	// On load of the new tab, check if there is any tag previously stored
	chrome.storage.local.get("tag", function(result) {

		if ( result.tag ) {
			
			$('input[type="text"]').val(result.tag);
			request();

		} else {

			$('.loading').hide();
			$('.message-welcome').show();
			
		}

	})


	if ( items_start === 0 ) {
		$('.prev').hide();
	}

	var do_render = function(data_from_cache) {

		// If data cache is empty. Make request. Else, render next media batch using data_cache
		// Faster UX as users don't need to wait a few secs/microsecs to view the next media batch
		if ( !data_from_cache ) {
			request();
		}
		else {
			renderer(data_cache);
		}

	};

	$('.next').on('click', function() {

		items_start += n;
		items_end += n;

		do_render(data_cache);		

		if ( items_start > 0 ) {
			$('.prev').show();
		}

		return false;
	})

	$('.prev').on('click', function() {

		items_start -= n;
		items_end -= n;

		do_render(data_cache);

		if ( items_start === 0 ) {
			$('.prev').hide();
		}

		$('.next').show();

		return false;
	})




	////

	$('.fa-question-circle').on('click', function() {

		$('.message-welcome').show();
		$('.fa-times').show();
		$('.fa-question-circle').hide();

		$('.grams-container').hide();

	});

	$('.fa-times').on('click', function() {

		$('.message-welcome').hide();
		$('.fa-times').hide();
		$('.fa-question-circle').show();

		$('.grams-container').show();

	});




});