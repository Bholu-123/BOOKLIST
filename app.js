//using ES6 classes
//book class
class Book{
    constructor(title,author,isbn){
        this.title=title;
        this.author=author;
        this.isbn=isbn;
    }
}
//UI class
class UI{

    //showAlert
    showAlert(message,className,field){

        // let className=
        //select the element having class name alert
        const alert=document.querySelector(`.${field}Alert`);

        console.log(alert);
        //create a text node
        const text=document.createTextNode(message);
        //add class name
        alert.classList.add(className);
        //append child
        alert.appendChild(text);
    
        // Timeout after 3 sec
        setTimeout(function(){
            document.querySelector(`.${field}Alert`).remove();
        }, 3000);
    }
     
    //add book
    addBookToList(book) {
        const list = document.getElementById('book-list');
        // Create tr element
        const row = document.createElement('tr');
        // Insert cols
        row.innerHTML = `
          <td>${book.title}</td>
          <td>${book.author}</td>
          <td>${book.isbn}</td>
          <td><a href="#" class="delete">X<a></td>
        `;
      
        list.appendChild(row);
           console.log(book.title);
        book.title='';
        book.author='';
        book.isbn='';
    }
}

document.querySelector('#book-form').addEventListener('submit', function(e){
    e.preventDefault();
    const title=document.querySelector('#title').value;
    const author=document.querySelector('#author').value;
    const isbn=document.querySelector('#isbn').value;
     
    //instantiate Bookclass
    const book=new Book(title,author,isbn);

    //instantiate UIclass
    const ui=new UI();
    //show alert for title
    if(title==='')
    {
        ui.showAlert(`Please fill title field`, 'error','title');
    }
    //show alert for author
    else if(author==='')
    {
        ui.showAlert(`Please fill  author field`, 'error','author');
    }
    //show alert for isbn
    else if(isbn==='')
    {
        ui.showAlert(`Please fill isbn field`, 'error','isbn');
    }
    else{
        //add book to list
        ui.addBookToList(book);
    }
})