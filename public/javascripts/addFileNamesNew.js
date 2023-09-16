// function previewMultiple(event) {
//     const form = document.querySelector('#formFile');
//     form.innerHTML = "";
//     var images = document.getElementById("image");
//     var number = images.files.length;
//     //images.files is a property of this element that contains an array-like object of the files that have been selected by the user. 
//     for (i = 0; i < number; i++) {
//         var urls = URL.createObjectURL(event.target.files[i]);
//         //event.target is the file input element (onchange="previewMultiple(event))
//         // take a file object, and creates a temporary URL that represents the content of that file. The temporary URL is unique and valid only for the duration of the current page session. 
//         form.innerHTML += '<img src="' + urls + '">';
//     }
// }

function previewMultiple(event) {
    const form = document.querySelector('#formFile');
    const warning = document.querySelector('#warning');
    form.innerHTML = "";
    var images = document.getElementById("image");
    var number = images.files.length;

    if (number > 3) {
        warning.textContent = "You can upload a maximum of 3 images.";
        images.value = null; // Clear the selected files
    } else {
        warning.textContent = ""; // Clear any previous warning
        for (i = 0; i < number; i++) {
            var urls = URL.createObjectURL(event.target.files[i]); // Access files using images.files[i]
            form.innerHTML += '<img src="' + urls + '">';
        }
    }
}
