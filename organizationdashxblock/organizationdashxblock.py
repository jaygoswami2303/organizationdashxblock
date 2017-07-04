"""TO-DO: Write a description of what this XBlock is."""

import pkg_resources
import requests
import MySQLdb
from django.http import HttpResponse

from xblock.core import XBlock
from xblock.fields import Scope, Integer
from xblock.fragment import Fragment

#host = 'http://10.129.103.53/'
host = 'http://localhost/'
token = 'asdfghjklqwertyuiopzxcvbnm'
header = {'Authorization': 'Bearer ' + token}
sql_user = 'root'
sql_pswd = ''
database = 'edxapp'

#id = 6

#id = self.xmodule_runtime.user_id

class OrganizationDashboardXBlock(XBlock):
    """
    TO-DO: document what your XBlock does.
    """

    # Fields are defined on the class.  You can access them in your code as
    # self.<fieldname>.

    # TO-DO: delete count, and define your own fields.
    count = Integer(
        default=0, scope=Scope.user_state,
        help="A simple counter, to show something happening",
    )

    def resource_string(self, path):
        """Handy helper for getting resources from our kit."""
        data = pkg_resources.resource_string(__name__, path)
        return data.decode("utf8")

    # TO-DO: change this view to display your data your own way.
    def student_view(self, context=None):
        """
        The primary view of the OrganizationDashboardXBlock, shown to students
        when viewing courses.
        """
	id = self.xmodule_runtime.user_id	

        try:
            db_mysql = MySQLdb.connect(user=sql_user, passwd=sql_pswd, db=database)  # Establishing MySQL connection
        except:
            print "MySQL connection not established"
            return HttpResponse("MySQL connection not established")  # MySQL could not be connected

        query = "select is_superuser from auth_user where id=%s"

        mysql_cursor = db_mysql.cursor()
        mysql_cursor.execute(query, (str(id),))
        student = mysql_cursor.fetchone()

        try:
            if student[0] == 1:
                html = self.resource_string("static/html/organizationdashxblock.html")
                frag = Fragment(html.format(self=self))
                frag.add_css(self.resource_string("static/css/organizationdashxblock.css"))
                frag.add_javascript(self.resource_string("static/js/src/organizationdashxblock.js"))
                frag.initialize_js('OrganizationDashboardXBlock')
                return frag
        except:
            None
        html = self.resource_string("static/html/studioxblock.html")
        frag = Fragment(html.format(self=self))
        frag.add_css(self.resource_string("static/css/studioxblock.css"))
        frag.add_javascript(self.resource_string("static/js/src/studioxblock.js"))
        frag.initialize_js('FacultyDashboardXBlock')
        return frag

    # TO-DO: change this view to display your data your own way.
    def studio_view(self, context=None):
        """
        The primary view of the FacultyDashboardXBlock, shown to students
        when viewing courses.
        """
        html = self.resource_string("static/html/studioxblock.html")
        frag = Fragment(html.format(self=self))
        frag.add_css(self.resource_string("static/css/studioxblock.css"))
        frag.add_javascript(self.resource_string("static/js/src/studioxblock.js"))
        frag.initialize_js('FacultyDashboardXBlock')
        return frag


    @XBlock.json_handler
    def get_organization_list(self, data, suffix=''):

        url = host + 'api/organizations/v1/summary/'

        response = requests.get(url, headers=header)

        organization = response.json()['results']

        while response.json()['next']!=None:
            url = response.json()['next']
            response = requests.get(url, headers=header)
            organization += response.json()['results']

        list = []

        for org in organization:
            list.append(org['organization_name'])

        return list

    # TO-DO: change this handler to perform your own actions.  You may need more
    # than one handler, or you may not need any handlers at all.
    @XBlock.json_handler
    def get_choice(self, data, suffix=''):
        """
        An example handler, which increments the data.
        """
        # Just to show data coming in...

        choice = data['choice']

        organization = data['organization']

        if choice == 'Show Count Enrollments for all courses':

            url = host + 'api/organizations/v1/summary/' + organization

            response = requests.get(url, headers=header)

            courses = response.json()['organization_course_list']

            list = []

            for course in courses:
                list.append({'name': course['course_id'], 'y': int(course['course_student_count']), })

            return list

        else:

            url = host + 'api/organizations/v1/certificate/' + organization

            response = requests.get(url, headers=header)

            courses = response.json()['courses']

            if choice == 'List all courses' or choice == 'Show Grades of a course':
                return courses

            elif choice == 'Show Count of certificates':

                list = []

                for course in courses:
                    list.append({'name': course['course_id'], 'y': course['certificate_count'], })

                return list

            elif choice == 'Show Discussion Forum Activity':
                list = []

                for course in courses:
                    url = host + 'api/courses/v2/discussions/courses/' + course['course_id']

                    response = requests.get(url, headers=header)

                    data = response.json()

                    if response.status_code != 404:
                        list.append(data)

                return list

    @XBlock.json_handler
    def get_detail(self, data, suffix=''):

        course_id = data['course_id'].split(":")[1]

        url = host + 'api/courses/v2/detail/' + str(course_id)

        response = requests.get(url, headers=header)

        return response.json()

    @XBlock.json_handler
    def get_certificate_list(self, data, suffix=''):

        course_id = data['course_id'].split(":")[1]

        url = host + 'api/courses/v2/certificates/detail/' + str(course_id)

        response = requests.get(url, headers=header)

        return response.json()

    @XBlock.json_handler
    def get_grade(self, data, suffix=''):

        course_id = data['course_id'].split(":")[1]

        url = host + 'api/courses/v2/grades/courses/' + str(course_id)

        response = requests.get(url, headers=header)

        students = response.json()['students']

        grades = {}

        for student in students:
            grade = student['grade']
            if grade != "":
                if grade not in grades.keys():
                    grades[grade] = 0
                grades[grade] = grades[grade] + 1

        list = []

        for key in grades.keys():
            list.append({'name': key, 'y': grades[key], })

        return list

    @XBlock.json_handler
    def get_grade_detail(self, data, suffix=''):

        course_id = data['course_id'].split(":")[1]

        url = host + 'api/courses/v2/grades/courses/' + str(course_id)

        response = requests.get(url, headers=header)

        students = response.json()['students']

        list = []

        for student in students:
            if student['grade'] == data['grade']:
                list.append(student)

        return list

    # TO-DO: change this to create the scenarios you'd like to see in the
    # workbench while developing your XBlock.
    @staticmethod
    def workbench_scenarios():
        """A canned scenario for display in the workbench."""
        return [
            ("OrganizationDashboardXBlock",
             """<organizationdashxblock/>
             """),
            ("Multiple OrganizationDashboardXBlock",
             """<vertical_demo>
                <organizationdashxblock/>
                <organizationdashxblock/>
                <organizationdashxblock/>
                </vertical_demo>
             """),
        ]
