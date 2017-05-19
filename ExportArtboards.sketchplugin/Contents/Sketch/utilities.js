// ****************************
//   Checking for updates
// ****************************

var lastUpdateCheckDay = ''

// If an update is available - alert the user
// return 'if the user opted to download an update'
function updateIfNeeded() {

  lastUpdateCheckDay = defaults.stringForKey(plugin.identifier() + '.lastUpdateCheckDay')

  if (isNewDay() && checkPluginUpdate()) {
    var alert = NSAlert.alloc().init()
    alert.setIcon(iconImage)
  	alert.setMessageText("New Update available 🔥")
  	alert.setInformativeText("There's a new update available for '" + plugin.name() + "'. Please download and install the new version.")
  	alert.addButtonWithTitle("Download")
    alert.addButtonWithTitle("Cancel")
    if (alert.runModal() == '1000') {
      NSWorkspace.sharedWorkspace().openURL(plugin.homepageURL())
      return true
    }
  }

  return false
}

// Return if an update has not been checked for today yet
function isNewDay() {
  return true

  var formatter = NSDateFormatter.alloc().init()
  formatter.setDateStyle(NSDateFormatterShortStyle)

  var today = formatter.stringFromDate(NSDate.date())
  defaults.setObject_forKey(today, plugin.identifier() + '.lastUpdateCheckDay')
  defaults.synchronize()

  return lastUpdateCheckDay ? lastUpdateCheckDay != today : true
}

// Check the remote repository for the manifest verion number
// Return whether there is a new update available
function checkPluginUpdate() {
  var baseURL = plugin.homepageURL().absoluteString().stringByReplacingOccurrencesOfString_withString('github.com', 'raw.githubusercontent.com')
  var pluginFolder = plugin.url().lastPathComponent().stringByAddingPercentEscapesUsingEncoding(NSUTF8StringEncoding)
  var url = baseURL + '/master/' + pluginFolder + '/Contents/Sketch/manifest.json'

  try {
    var request = NSURLRequest.requestWithURL(NSURL.URLWithString(url))
    var response = NSURLConnection.sendSynchronousRequest_returningResponse_error(request, nil, nil)
    var data =  NSJSONSerialization.JSONObjectWithData_options_error(response, 0, nil)
    return data && data.version && data.version.toString() != plugin.version()
  } catch (e) {
    return false
  }
}

// ****************************
//   Helper methods
// ****************************

// Return the version number for sketch — turned into a single integer
// e.g. '3.8.5' => 385, '40.2' => 402
function sketchVersionNumber() {
  var version = NSBundle.mainBundle().objectForInfoDictionaryKey("CFBundleShortVersionString")
  var versionNumber = version.stringByReplacingOccurrencesOfString_withString(".", "") + ""
  while(versionNumber.length != 3) {
    versionNumber += "0"
  }
  return parseInt(versionNumber)
}
