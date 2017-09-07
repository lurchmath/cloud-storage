
# To-Do List for Cloud Storage Dialogs

This project was put together rather quickly, and there are many polishing
tasks that should be done to improve the overall quality of this module.
I list them in this file.

## Aesthetics

 * The open/save dialogs are extremely ugly, because near-zero CSS styling
   has been done to them.  Update [dialog.css](dialog.css) to make them more
   beautiful.  Useful notes:
    * Each file/folder in the dialog is a `div` with class `filesListItem`.
    * Each file in the dialog has the attribute `data-type="file"`.
    * Each folder in the dialog has the attribute `data-type="folder"`.
    * The Open, Save, and Cancel buttons are defined in
      [dialog.html](dialog.html), and you can see their element types and
      IDs there.
    * In that same HTML file you will find the IDs for the files list and
      buttons footer.
    * Other tidbits appear in the existing [dialog.css](dialog.css) file.
