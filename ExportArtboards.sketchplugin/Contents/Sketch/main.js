@import 'utilities.js'

// Global initalised variables from 'context'
var selection, doc, plugin, app, iconImage
var isUpdating = false // If the user is being redirected to download an update

var defaults // User Defaults for saving data

function onSetUp(context) {
  print("setup")
  selection = context.selection
  doc = context.document
  plugin = context.plugin
  app = NSApplication.sharedApplication()
  iconImage = NSImage.alloc().initByReferencingFile(plugin.urlForResourceNamed('Icons/icon.png').path())
  defaults = NSUserDefaults.alloc().initWithSuiteName(plugin.identifier())
  isUpdating = updateIfNeeded()
}

function onTearDown() {
  // Save User Defaults if necessary
}


// ****************************
//   Plugin command handlers
// ****************************

function run(context) {
  if (isUpdating) return

  if (selection.count() < 1) {
    return alert("Select Artboards", "Select at least one artboard first!")
  }

  // Make sure that every layer selected is an Artboard
  var selectedArtboards = selection.every(function(layer){
    return layer.isMemberOfClass(MSArtboardGroup)
  })

  if (!selectedArtboards) {
    return alert("Only artboards allowed", "Please only select artboards!.")
  }


  // Keep track of all the temporary slices we create, so we can delete them later
  var slices = []

  // For each selected artboard we want to export
  selection.forEach(function(artboard) {
    var slice = MSSliceLayer.sliceLayerFromLayer(artboard)

    var rect = artboard.absoluteRect()
    slice.absoluteRect().setX(rect.origin().x)
    slice.absoluteRect().setY(rect.origin().y)
    slice.absoluteRect().setWidth(rect.size().width)
    slice.absoluteRect().setHeight(rect.size().height)

    // Create a new slice for each artboard
    // and add all the same export properties to the new slice
    artboard.exportOptions().exportFormats().forEach(function(exportOption, index) {
      if (index != 0) {
        slice.exportOptions().addExportFormat()
      }

      var sliceExportOption = slice.exportOptions().exportFormats().lastObject()
      sliceExportOption.scale = exportOption.scale()
      sliceExportOption.name = exportOption.name()
      sliceExportOption.fileFormat = exportOption.fileFormat()
    })

    slices.push(slice)
  })

  // Export all the slices at once
  doc.exportSliceLayers(slices)

  // Remove our temporary slices from the document
  slices.forEach(function(slice) {
    slice.removeFromParent()
  })

}

// Show a message alert
function alert(title, message) {

  var alert = NSAlert.alloc().init()
  alert.setIcon(iconImage)
	alert.setMessageText(title)
	alert.setInformativeText(message)
	alert.addButtonWithTitle("Got it!")

  return alert.runModal()
}
