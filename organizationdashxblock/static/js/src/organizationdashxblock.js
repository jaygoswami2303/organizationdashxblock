/* Javascript for OrganizationDashboardXBlock. */
function OrganizationDashboardXBlock(runtime, element) {

    function hideChoice() {
        hideAll();
        $("#button").hide();
        var choice = document.getElementById("choice");
        while(choice.firstChild) {
            choice.removeChild(choice.firstChild);
        }
        $("#choice").hide();
        $("#heading").hide();
    }

    function hideAll() {
        var ul = document.getElementById("list");
        while(ul.firstChild) {
            ul.removeChild(ul.firstChild);
        }
        //document.getElementById("list").setAttribute("hidden", "true");
        $("#list").hide();
        var student_table = document.getElementById("student_table");

        while (student_table.rows.length > 0) {
            student_table.deleteRow(0);
        }
        //student_table.setAttribute("hidden", true);
        $("#student_table").hide();

        //document.getElementById("student_heading").setAttribute("hidden", true);
        $("#student_heading").hide();

        var course_table = document.getElementById("course_table");

        while (course_table.rows.length > 0) {
            course_table.deleteRow(0);
        }
        //course_table.setAttribute("hidden", true);
        $("#course_table").hide();
        //document.getElementById("course_heading").setAttribute("hidden", "true");
        $("#course_heading").hide();
        //document.getElementById("container").setAttribute("hidden", "true");
        $("#container").hide();
        //document.getElementById("course_button").setAttribute("hidden", "true");
        $("#course_button").hide();
        var course_choice = document.getElementById("course_choice");
        while(course_choice.firstChild) {
            course_choice.removeChild(course_choice.firstChild);
        }
        //document.getElementById("course_choice").setAttribute("hidden", "true");
        $("#course_choice").hide();
        //document.getElementById("select_heading").setAttribute("hidden", "true");
        $("#select_heading").hide();
    }

    function choice(result) {

        if(result == null) {
            //document.getElementById("course_heading").removeAttribute("hidden");
            $("#course_heading").show();

            document.getElementById("course_heading").innerHTML = "YOU ARE NOT A FACULTY!!!";
        }
        else if(document.getElementById("choice").value == 'List all courses') {
            listCourses(result);
        }
        else if(document.getElementById("choice").value == 'Show Count Enrollments for all courses') {
            showCountEnrollments(result);
        }
        else if(document.getElementById("choice").value == 'Show Count of certificates') {
            showCountCertificate(result);
        }
        else if(document.getElementById("choice").value == 'Show Discussion Forum Activity') {
            showDiscussionForumActivity(result);
        }
        else if(document.getElementById("choice").value == 'Show Grades of a course') {
            showCourseChoices(result);
        }
    }

    function showCourseChoices(result) {

        //document.getElementById("select_heading").removeAttribute("hidden");
        $("#select_heading").show();

        document.getElementById("select_heading").innerHTML = "SELECT A COURSE TO DISPLAY THE GRADES";

        var select = document.getElementById("course_choice");
        //select.removeAttribute("hidden");
        $("#course_choice").show();
        for(var i=0,len=result.length;i<len;i++) {
            var option = document.createElement("option");
            option.text = result[i]['course_id'];
            select.add(option);
        }

        //document.getElementById("course_button").removeAttribute("hidden");
        $("#course_button").show();
    }

    $('#course_button', element).click(function(eventObject) {
        $.ajax({
            type: "POST",
            url: handlerGrade,
            data: JSON.stringify({"course_id": document.getElementById("course_choice").value}),
            success: showGrades
        });
    });

    var handlerGrade = runtime.handlerUrl(element, 'get_grade');

    function showGrades(result) {

        //document.getElementById("container").removeAttribute("hidden");
        $("#container").show();

        Highcharts.chart('container', {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: 'Grades for ' + document.getElementById("course_choice").value
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.y}',
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                        }
                    }
                }
            },
            series: [{
                name: 'Number of students',
                colorByPoint: true,
                data: result,
                point: {
                    events:{
                        click: function (event) {
                            $.ajax({
                                type: "POST",
                                url: handlerGradeDetail,
                                data: JSON.stringify({"grade": this.name, "course_id": document.getElementById("course_choice").value}),
                                success: showGradeDetail
                            });
                        }
                    }
                }
            }],

        });

    }

    var handlerGradeDetail = runtime.handlerUrl(element, 'get_grade_detail');

    function showGradeDetail(result) {
        //alert(JSON.stringify(result));

        var student_table = document.getElementById("student_table");

        while (student_table.rows.length > 0) {
            student_table.deleteRow(0);
        }
        //student_table.setAttribute("hidden", true);
        $("#student_table").hide();

        //document.getElementById("student_heading").setAttribute("hidden", true);
        $("#student_heading").hide();

        var course_table = document.getElementById("course_table");

        while (course_table.rows.length > 0) {
            course_table.deleteRow(0);
        }
        //course_table.setAttribute("hidden", true);
        $("#course_table").hide();

        //document.getElementById("course_heading").removeAttribute("hidden");
        $("#course_heading").hide();

        //document.getElementById("student_heading").removeAttribute("hidden");
        $("#student_heading").show();

        var students = [];

        for(var i=0;i<result.length;i++) {
            var current = result[i];
            var units = current['units'];
            delete current['units'];
            students.push(Object.assign({}, current, units));
        }

        //alert(JSON.stringify(students));

        if (students.length > 0) {
            document.getElementById("student_heading").innerHTML = "STUDENTS DETAILS";
            //student_table.removeAttribute("hidden");
            $("#student_table").show();

            var row = student_table.insertRow(0);

            var i = 0;
            var list = [];
            for (var key in students[0]) {
                var cell = row.insertCell(i);

                cell.innerHTML = key;

                list.push(key);

                i++;
            }
            //alert(JSON.stringify(list));


            count = 1;

            for (i = 0, len = students.length; i < len; i++) {
                var row = student_table.insertRow(count);
                var j = 0;
                for (var k = 0, len1 = list.length; k < len1; k++) {
                    var cell = row.insertCell(j);

                    //alert(JSON.stringify(students[i][list[k]]) + JSON.stringify(list[k]));
                    if(list[k]=='last_login') {
                        var d = new Date(students[i][list[k]]);
                        cell.innerHTML = d.toDateString() + " " + d.toTimeString();
                        //cell.innerHTML = students[i][list[k]];
                    }
                    else
                        cell.innerHTML = students[i][list[k]];

                    j++;
                }
                count++;
            }
        }
        else {
            document.getElementById("student_heading").innerHTML = "NO STUDENT ENROLLED IN THE COURSE"
        }

    }

    function listCourses(result) {
        var ul = document.getElementById("list");
        //ul.removeAttribute("hidden");
        $("#list").show();
        for(var i=0,len=result.length;i<len;i++) {
            var li = document.createElement("li");
            li.appendChild(document.createTextNode(result[i]['course_id']));
            ul.appendChild(li);
        }
    }

    function showCountEnrollments(result) {

        //document.getElementById("container").removeAttribute("hidden");
        $("#container").show();

        Highcharts.chart('container', {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: 'Count Enrollments for all courses'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.y}',
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                        }
                    }
                }
            },
            series: [{
                name: 'Number of students',
                colorByPoint: true,
                data: result,
                point: {
                    events:{
                        click: function (event) {
                            $.ajax({
                                type: "POST",
                                url: handlerDetail,
                                data: JSON.stringify({"course_id": this.name}),
                                success: showDetails
                            });
                            //alert(this.name);
                        }
                    }
                }
            }],

        });

    }

    function showDetails(result) {

        var student_table = document.getElementById("student_table");

        while (student_table.rows.length > 0) {
            student_table.deleteRow(0);
        }
        //student_table.setAttribute("hidden", true);
        $("#student_table").hide();

        //document.getElementById("student_heading").setAttribute("hidden", true);
        $("#student_heading").hide();

        var course_table = document.getElementById("course_table");

        while (course_table.rows.length > 0) {
            course_table.deleteRow(0);
        }
        //course_table.setAttribute("hidden", true);
        $("#course_table").hide();

        //document.getElementById("course_heading").removeAttribute("hidden");
        $("#course_heading").show();

        document.getElementById("course_heading").innerHTML = "COURSE DETAILS";

        //course_table.removeAttribute("hidden");
        $("#course_table").show();

        var students;

        var count = 0;
        for (var key in result) {
            if (key == 'students') {
                students = result[key]
                continue
            }
            var row = course_table.insertRow(count);
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);

            cell1.innerHTML = key;
            cell2.innerHTML = result[key];
            count++;
        }

        //document.getElementById("student_heading").removeAttribute("hidden");
        $("#student_heading").show();

        if (students.length > 0) {
            document.getElementById("student_heading").innerHTML = "STUDENTS DETAILS";
            //student_table.removeAttribute("hidden");
            $("#student_table").show();

            var row = student_table.insertRow(0);

            var i = 0;
            var list = [];
            for (var key in students[0]) {
                var cell = row.insertCell(i);

                cell.innerHTML = key;

                list.push(key);

                i++;
            }
            //alert(JSON.stringify(list));


            count = 1;

            for (i = 0, len = students.length; i < len; i++) {
                var row = student_table.insertRow(count);
                var j = 0;
                for (var k = 0, len1 = list.length; k < len1; k++) {
                    var cell = row.insertCell(j);

                    //alert(JSON.stringify(students[i][list[k]]) + JSON.stringify(list[k]));
                    if(list[k]=='last_login') {
                        var d = new Date(students[i][list[k]]);
                        cell.innerHTML = d.toDateString() + " " + d.toTimeString();
                        //cell.innerHTML = students[i][list[k]];
                    }
                    else
                        cell.innerHTML = students[i][list[k]];

                    j++;
                }
                count++;
            }
        }
        else {
            document.getElementById("student_heading").innerHTML = "NO STUDENT ENROLLED IN THE COURSE"
        }
    }

    var handlerDetail = runtime.handlerUrl(element, 'get_detail');

    function showCertificateList(result) {

        var student_table = document.getElementById("student_table");

        while (student_table.rows.length > 0) {
            student_table.deleteRow(0);
        }
        //student_table.setAttribute("hidden", true);
        $("#student_table").hide();

        //document.getElementById("student_heading").setAttribute("hidden", true);
        $("#student_heading").hide();

        var course_table = document.getElementById("course_table");

        while (course_table.rows.length > 0) {
            course_table.deleteRow(0);
        }
        //course_table.setAttribute("hidden", true);
        $("#course_table").hide();

        //document.getElementById("course_heading").removeAttribute("hidden");
        $("#course_heading").show();

        document.getElementById("course_heading").innerHTML = "COURSE DETAILS";

        //course_table.removeAttribute("hidden");
        $("#course_table").show();

        var students;

        var count = 0;
        for (var key in result) {
            if (key == 'certificate_students') {
                students = result[key]
                continue
            }
            var row = course_table.insertRow(count);
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);

            cell1.innerHTML = key;
            cell2.innerHTML = result[key];
            count++;
        }

        //document.getElementById("student_heading").removeAttribute("hidden");
        $("#student_heading").show();

        if (students.length > 0) {
            document.getElementById("student_heading").innerHTML = "STUDENTS DETAILS";
            //student_table.removeAttribute("hidden");
            $("#student_table").show();

            var row = student_table.insertRow(0);

            var i = 0;
            var list = [];
            for (var key in students[0]) {
                var cell = row.insertCell(i);

                cell.innerHTML = key;

                list.push(key);

                i++;
            }
            //alert(JSON.stringify(list));


            count = 1;

            for (i = 0, len = students.length; i < len; i++) {
                var row = student_table.insertRow(count);
                var j = 0;
                for (var k = 0, len1 = list.length; k < len1; k++) {
                    var cell = row.insertCell(j);

                    //alert(JSON.stringify(students[i][list[k]]) + JSON.stringify(list[k]));
                    cell.innerHTML = students[i][list[k]];

                    j++;
                }
                count++;
            }
        }
        else {
            document.getElementById("student_heading").innerHTML = "NO STUDENT GOT CERTIFICATE IN THE COURSE"
        }
    }

    var handlerCertificate = runtime.handlerUrl(element, 'get_certificate_list');

    function showCountCertificate(result) {

        var courses = [];
        var certificate_count = [];

        for(var i=0;i<result.length;i++) {
            var course = result[i];
            courses.push(course['name']);
            certificate_count.push(course['y']);
        }

        //document.getElementById("container").removeAttribute("hidden");
        $("#container").show();

        Highcharts.chart('container', {
            chart: {
                type: 'bar'
            },
            title: {
                text: 'Certificate Count for all courses'
            },
            xAxis: {
                categories: courses,
                title: {
                    text: 'Courses'
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'number of certificates',
                },
                tickInterval: 1,
            },
            plotOptions: {
                bar: {
                    dataLabels: {
                        enabled: true
                    },
                }
            },
            series: [{
                name: 'Certificate',
                data: certificate_count,
                point: {
                    events:{
                        click: function (event) {
                            $.ajax({
                                type: "POST",
                                url: handlerCertificate,
                                data: JSON.stringify({"course_id": this.category}),
                                success: showCertificateList
                            });
                        }
                    }
                }
            },]
        });

    }

    function showDiscussionForumActivity(result) {

        var courses = [];
        var question_count = [];
        var discussion_count = [];

        for(var i=0;i<result.length;i++) {
            var course = result[i];
            courses.push(course['course_id']);
            question_count.push(course['count']['question']);
            discussion_count.push(course['count']['discussion']);
        }

        //document.getElementById("container").removeAttribute("hidden");
        $("#container").show();

        Highcharts.chart('container', {
            chart: {
                type: 'column'
            },
            title: {
                text: 'Discussion Forum Activity for all courses'
            },
            xAxis: {
                categories: courses,
                title: {
                    text: 'Courses'
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'number of discussions',
                },
                tickInterval: 1,
            },
            plotOptions: {
                column: {
                    stacking: 'normal',
                    dataLabels: {
                        enabled: true
                    },
                }
            },
            series: [{
                name: 'Question',
                data: question_count
            },
            {
                name: 'Discussion',
                data: discussion_count
            }]
        });
    }

    var handlerUrl = runtime.handlerUrl(element, 'get_choice');

    $('#button', element).click(function(eventObject) {
        hideAll();
        $.ajax({
            type: "POST",
            url: handlerUrl,
            data: JSON.stringify({"choice": document.getElementById("choice").value, "organization": document.getElementById("organization_choice").value}),
            success: choice
        });
    });

    function showChoices(result) {

        var select = document.getElementById("choice");

        var choices = ['Show Count Enrollments for all courses', 'List all courses', 'Show Count of certificates', 'Show Discussion Forum Activity', 'Show Grades of a course'];

        var detail = 'Show Detailed Enrollments for all courses';

        for(var i=0,len=choices.length;i<len;i++) {
            var option = document.createElement("option");
            option.text = choices[i]
            select.add(option);
        }

        $('#button').click();
    }

    function showOrganizations(result) {
        var select = document.getElementById("organization_choice");

        for(var i=0,len=result.length;i<len;i++) {
            var option = document.createElement("option");
            option.text = result[i]
            select.add(option);
        }
    }

    $('#organization_button', element).click(function(eventObject) {
        hideChoice();
        $("#heading").show();
        showChoices();
        $("#choice").show();
        $("#button").show();
    });

    var handlerOrganization = runtime.handlerUrl(element, 'get_organization_list');

    $(function ($) {
        /* Here's where you'd do things on page load. */
        hideChoice();
        $.ajax({
            type: "POST",
            url: handlerOrganization,
            data: JSON.stringify("hello"),
            success: showOrganizations
        });
        //showChoices();
    });
}
