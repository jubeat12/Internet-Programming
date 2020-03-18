#!/usr/bin/env python3

# See https://docs.python.org/3.x/library/socket.html
# for a description of python socket and its parameters
# 
# Copyright 2018, Daniel J. Challou, All rights reserved.
# For use by students enrolled in Csci 4131 during the Fall 2018 
# Semester at the University of
# Minnesota-Twin Cities only. Do not copy or redistribute
# without the express written consent of the authors.
#
import socket

#add the following
import socket
import os
import stat
import sys
import urllib.parse
import datetime

from threading import Thread
from argparse import ArgumentParser



BUFSIZE = 4096
#add the following
CRLF = '\r\n'
METHOD_NOT_ALLOWED = 'HTTP/1.1 405  METHOD NOT ALLOWED{}Allow: GET, HEAD, POST {}Connection: close{}{}'.format(CRLF, CRLF, CRLF, CRLF)
OK = 'HTTP/1.1 200 OK{}{}{}'.format(CRLF, CRLF, CRLF)
NOT_FOUND = 'HTTP/1.1 404 NOT FOUND{}Connection: close{}{}'.format(CRLF, CRLF, CRLF)
FORBIDDEN = 'HTTP/1.1 403 FORBIDDEN{}Connection: close{}{}'.format(CRLF, CRLF, CRLF)
MOVED_PERMANENTLY = 'HTTP/1.1 301 MOVED PERMANENTLY{}Location:  https://twin-cities.umn.edu/{}Connection: close{}{}'.format(CRLF, CRLF, CRLF, CRLF)
NOT_ACCEPTABLE = 'HTTP/1.1 406 NOT ACCEPTABLE{}'.format(CRLF)

def get_contents(fname):
    with open(fname, 'rb') as f:
        return f.read()


def check_perms(resource):
    """Returns True if resource has read permissions set on 'others'"""
    stmode = os.stat(resource).st_mode
    return (getattr(stat, 'S_IROTH') & stmode) > 0
	

#note, client talk is no longer used. The accept request method defined below in the HTTP_HeadServer Class replaced it. 	
def client_talk(client_sock, client_addr):
    print('talking to {}'.format(client_addr))
    data = client_sock.recv(BUFSIZE)
    while data:
      print(data.decode('utf-8'))
      data = client_sock.recv(BUFSIZE)

    # clean up
    client_sock.shutdown(1)
    client_sock.close()
    print('connection closed.')

class HTTP_HeadServer:  #A re-worked version of EchoServer
  def __init__(self, host, port):
    print('listening on port {}'.format(port))
    self.host = host
    self.port = port

    self.setup_socket()

    self.accept()

    self.sock.shutdown()
    self.sock.close()

  def setup_socket(self):
    self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    self.sock.bind((self.host, self.port))
    self.sock.listen(128)

  def accept(self):
    while True:
      (client, address) = self.sock.accept()
      #th = Thread(target=client_talk, args=(client, address))
      th = Thread(target=self.accept_request, args=(client, address))
      th.start()

  # here, we add a function belonging to the class to accept 
  # and process a request
  def accept_request(self, client_sock, client_addr):
    print("accept request")
    data = client_sock.recv(BUFSIZE)
    req = data.decode('utf-8') #returns a string
    response=self.process_request(req) #returns a string
    #once we get a response, we chop it into utf encoded bytes
    #and send it (like EchoClient)
    #client_sock.send(bytes(response,'utf-8'))
    client_sock.send(response)
    #clean up the connection to the client
    #but leave the server socket for recieving requests open
    client_sock.shutdown(1)
    client_sock.close()

  #added a method to process requests, only head is handled in this code
  def process_request(self, request):
    print('######\nREQUEST:\n{}######'.format(request))
    linelist = request.strip().split(CRLF)
    reqline = linelist[0]
    rlwords = reqline.split()
    if len(rlwords) == 0:
        return ''
	
    if 'umntc' in request:
        return [MOVED_PERMANENTLY, 'Location', 'https://twin-cities.umn.edu/']
			
    if rlwords[0] == 'HEAD':
        resource = rlwords[1][1:] # skip beginning /
        return self.head_request(resource)
    elif rlwords[0] == 'GET':
        resource = rlwords[1][1:]
        return self.get_request(resource)
    elif rlwords[0] == 'POST':
        resource = linelist[len(linelist)-1]
        return self.post_request(resource)
    else:
        return METHOD_NOT_ALLOWED

  def head_request(self, resource):
    """Handles HEAD requests."""
    path = os.path.join('.', resource) #look in directory where server is running
    if resource == 'umntc':
      ret = bytes(MOVED_PERMANENTLY, 'utf-8')
    elif not os.path.exists(resource):
      ret = bytes(NOT_FOUND, 'utf-8')
    elif not check_perms(resource):
      ret = bytes(FORBIDDEN, 'utf-8')
    else:
      ret = bytes(OK, 'utf-8')
    return ret

#to do a get request, read resource contents and append to ret value.
#(you should check types of accept lines before doing so)

  def get_request(self, resource):
    """Handles get requests."""
    path = os.path.join('.', resource) #look in directory where server is running
    res, resourceext = os.path.splitext(resource)
    if resource == 'umntc':
      ret = bytes(MOVED_PERMANENTLY, 'utf-8')
    elif not os.path.exists(resource):
      content = get_contents(os.path.join('.', '404.html'))
      ret = bytes(NOT_FOUND, 'utf-8')+content
    elif not check_perms(resource):
      content = get_contents(os.path.join('.', '403.html'))
      ret = bytes(FORBIDDEN, 'utf-8')+content
    else:
      if(resourceext == '.html'):
        content = get_contents(resource)
        ret = bytes('HTTP/1.1 200 OK{} Content-type: text/html {}{}'.format(CRLF, CRLF, CRLF), 'utf-8') + content
      elif(resourceext == '.mp3'):
        content = get_contents(resource)
        ret = bytes('HTTP/1.1 200 OK{} Content-type: audio/mpeg {}{}'.format(CRLF, CRLF, CRLF), 'utf-8') + content
      elif(resourceext == '.png'):
        content = get_contents(resource)
        ret = bytes('HTTP/1.1 200 OK{} Content-type: image/png {}{}'.format(CRLF, CRLF, CRLF), 'utf-8') + content
    return ret
	
  def post_request(self, resource):
    """Handles post requests."""
    arr = resource.split('&')
    for i in range(len(arr)):
        arr[i] = arr[i].split('=')
    body = """
			<html>
				<body>
					<h2> Following Form Data Submitted Successfully:</h2>
					<table>
						<tbody>
							<tr>
								<td>
									eventname
								</td>
								<td>
									{}
								</td>
							</tr>
							<tr>
								<td>
									starttime
								</td>
								<td>
									{}
								</td>
							</tr>
							<tr>
								<td>
									endtime
								</td>
								<td>
									{}
								</td>
							</tr>
							<tr>
								<td>
									location
								</td>
								<td>
									{}
								</td>
							</tr>
							<tr>
								<td>
									day
								</td>
								<td>
									{}
								</td>
							</tr>
						</tbody>
					</table>
				</body>
			  </html>""".format(arr[0][1], arr[1][1], arr[2][1], arr[3][1], arr[4][1])

    ret = bytes(OK+body, 'utf-8')
    return ret

def parse_args():
  parser = ArgumentParser()
  parser.add_argument('--host', type=str, default='localhost',
                      help='specify a host to operate on (default: localhost)')
  parser.add_argument('-p', '--port', type=int, default=9001,
                      help='specify a port to operate on (default: 9001)')
  args = parser.parse_args()
  return (args.host, args.port)


if __name__ == '__main__':
  (host, port) = parse_args()
  HTTP_HeadServer(host, port) #Formerly EchoServer


