# organizationdashxblock


The xblock in this repository works on open edX platform.

#### Requirements
[course_dashboard_api](https://github.com/jaygoswami2303/course_dashboard_api.git)
[organization_dashboard_api](https://github.com/DhruvThakker/organization_dashboard_api.git)

### Installation

* Clone the repository:

  https://github.com/jaygoswami2303/organizationdashxblock.git
  
* Run the command 
```bash
sudo -u edxapp/edx/bin/pip.edxapp install /path/to/your/block
```

* Add the name of the xblock (organizationdashxblock) in the key ‘INSTALLED_APPS’ in python files /edx/app/edxapp/edx-platform/lms/envs/common.py and /edx/app/edxapp/edx-platform/cms/envs/common.py

```python
INSTALLED_APPS = (

...

‘organizationdashxblock’ ,

)
```

* Restart LMS and CMS servers by the command:
```bash
sudo /edx/bin/supervisorctl restart edxapp:
```
