$(document).ready(function(){
	$('.deleteUser').on('click', deleteUser);
});

function deleteUser(){
	//alert('Borrar!');
	alert($(this).data('id'));
}

function deleteUser(){
    var confirmation = confirm('Are You Sure?');
	if(confirmation){
		$.ajax({
			type: 'DELETE',
			url:  '/users/delete/'+$(this).data('id')
		}).done(function(response){
			window.location.replace('/admin')
		});
	} else {
		return false;
	}

}


$(document).ready(function(){
	$('.editUser').on('click', editUser);
});



// getElementById
function $id(id) {
	return document.getElementById(id);
}

function editUser(){
	// Changes the value of the button
	console.log('Habilitar edición');
	var form = $id("form");

	document.getElementById("form").action='/users/update/'+$(this).data('id')
	form.submit.value='Editar';
	form.first_name.value=$(this).data('first_name');
	form.last_name.value=$(this).data('last_name');
	form.email.value=$(this).data('email');



	}
