# Inspired by Gabor Szabo's example at https://code-maven.com/static-server-in-python
#
# Copyright 2019 by Quopt IT Services BV
#
#  Licensed under the Artistic License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#    https://opensource.org/licenses/Artistic-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.


from http.server import HTTPServer, BaseHTTPRequestHandler
import os, sys

root = ""

content_type = {
  "css" : "text/css",
  "css" : "text/css",
  "js": "application/javascript",
  "json": "application/json",
  "url": "application/x-www-form-urlencoded",
  "xml": "application/xml",
  "zip": "application/zip",
  "pdf": "application/pdf",
  "sql": "application/sql",
  "gql": "application/graphql",
  "json-ld": "application/ld+json",
  "doc": "application/msword",
  "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "xls": "application/vnd.ms-excel",
  "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "ppt": "application/vnd.ms-powerpoint",
  "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation ",
  "odt": "application/vnd.oasis.opendocument.text",
  "mpg": "audio/mpeg",
  "mpeg": "audio/mpeg",
  "ogg": "audio/ogg",
  "bin": "multipart/form-data",
  "css": "text/css",
  "html": "text/html",
  "htm": "text/html",
  "xml": "text/xml",
  "csv": "text/csv",
  "txt": "text/plain",
  "png": "image/png",
  "jpg": "image/jpeg",
  "jpeg": "image/jpeg",
  "gif": "image/gif"  
}

class StaticServer(BaseHTTPRequestHandler):
 
    def do_GET(self):
        global root, content_type
        if self.path == '/':
            filename = root + os.sep +'default.htm'
        else:
            filename = root + self.path
        print(filename)

        self.send_response(200)
        
        filename_base, file_extension = os.path.splitext(filename)
        file_extension = file_extension.lower()
        if file_extension == "":
           file_extension = "html"
        
        try:
          self.send_header('Content-type', content_type[file_extension])
        except:
          pass		
        
        self.end_headers()
        with open(filename, 'rb') as fh:
            html = fh.read()
            self.wfile.write(html)
 
def run(server_class=HTTPServer, handler_class=StaticServer, port=8000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print('Starting httpd on port {}'.format(port))
    httpd.serve_forever()

root = os.getcwd()
run()
