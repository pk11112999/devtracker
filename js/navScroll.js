// Written by PetaKowa May 29, 2015
// Scroll to target with nav links
// Each li (or a) must have an attribute 'data-scroll-target' with the just name of the target div
// On click, the function gets the target name, adds a hash, finds the target, gets the target's top position and scrolls to it
$(function(){
	$('#nav-scroll').on('click', 'li', function(){
		// if using boostrap scrollSpy, prevent from following link
		$('a').on("click", function (e) {
			e.preventDefault();
		});
	
		// get target name
		var $id = $(this).attr('data-scroll-target');
		// add hash for selector
		var sel = '#' + $id;
		// identify target
		var	$target = $(sel).offset();
		// event.stopPropagation();
		// get target's top position
		var $targetTop = $target.top;
		// animate scroll to target
		$('html,body').animate({
			scrollTop: $targetTop
		}, 800);
	});
});