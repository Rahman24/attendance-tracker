const loader = `
  <div class="loading">
    <div class="effect-1 effects"></div>
    <div class="effect-2 effects"></div>
    <div class="effect-3 effects"></div>
  </div>
`;
const getClasses = () => {
  var firestore = firebase.firestore();
  var user = firebase.auth().currentUser;
  var mail = user.email;
  document.getElementById("main").innerHTML=loader;
  var elements = '<div class="container">';
  firestore.doc(`faculties/${mail}`).get().then((r) => {
    elements += `<h3 class="my-3">Hello ${r.data().name}</h3><form id="classSelection" class="row justify-content-center">`;
    for (i in r.data().class) {
      elements += `
        <input type="radio" class="btn-check" name="class" required id="${r.data().class[i].dept}-${r.data().class[i].year}-${r.data().class[i].sub}" value="${r.data().class[i].dept}-${r.data().class[i].year}-${r.data().class[i].sub}" autocomplete="off">
        <label class="card btn btn-outline-primary p-0 m-3" for="${r.data().class[i].dept}-${r.data().class[i].year}-${r.data().class[i].sub}">
          <div class="card-body">
            <h5 class="card-title">${r.data().class[i].name}</h5>
            <div class="card-text"><b>Year: </b>${r.data().class[i].year} <b>Dept: </b>${r.data().class[i].dept.toUpperCase()}</div>
          </div>
        </label>
      `;
    }
    elements += `
      <div class="btn-group my-3" role="group">
        <input type="submit" value="Record" class="btn btn-dark text-center" onclick="takeAttendance()" />
        <input type="submit" value="Download" class="btn btn-dark text-center" onclick="downloadAttendance()" />
        <input type="submit" value="Edit" class="btn btn-dark text-center" onclick="editAttendance()" />
      </div>
      <div class="btn-group my-3" role="group">
        <button class='btn btn-success text-center' onclick='addSubject()'>Add Subject</button>
        <button class='btn btn-danger text-center' onclick='removeSubject()'>Remove Subject</button>
      </div>
      <div class="btn-group my-3" role="group">
        <button class='btn btn-success text-center' onclick='addClass()'>Add Class</button>
        <button class='btn btn-danger text-center' onclick='removeClass()'>Remove Class</button>
      </div>
      </form>
    `
    document.getElementById('main').innerHTML = elements;
    document.getElementById("classSelection").addEventListener("submit", (e) => {
      e.preventDefault();
      document.getElementById("main").innerHTML=loader;
    })
  }).catch((e) => {
    document.getElementById('main').innerHTML = `<div class='container'><button class='btn btn-secondary text-center fw-bold w-50' onclick='signin()'>Sign in with Google</button></div>`;
    alert(e.message);
  })
}
const signin = () => {
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider).then((r) => {
    getClasses(r.user)
  }).catch((e) => {
    document.getElementById('main').innerHTML = `<div class='container'><button class='btn btn-secondary text-center fw-bold w-50' onclick='signin()'>Sign in with Google</button></div>`;
    alert(e.message);
  })
}
const checkSignin = () => {
  var user = firebase.auth().currentUser;
  if (user!=null) {
    getClasses();
  } else {
    signin();
  }
}
const repeat = setInterval(() => {
  if (firebase!=undefined) {
    if (firebase.auth().currentUser!=null) {
      clearInterval(repeat);
      checkSignin();
    }
  }
}, 1000)
var tabdata = [];
const addClass = () => {
  elements = `
      <h3 class='my-3'>Upload Details</h3>
      <form id='add-class' method='POST'>
        <div class="form-group my-3">
          <label for="dept">Department</label>
          <select id="dept" class="form-control" required>
            <option selected>Select</option>
            <option value='civil'>Civil</option>
            <option value='cse'>CSE</option>
            <option value='ece'>ECE</option>
            <option value='eee'>EEE</option>
            <option value='eie'>EIE</option>
            <option value='ibt'>IBT</option>
            <option value='mech'>Mech</option>
            <option value='prod'>Prod</option>
          </select>
        </div>
        <div class="form-group my-3">
          <label for="year">Year</label>
          <select id="year" class="form-control" required>
            <option selected>Select</option>
            <option value='1'>1</option>
            <option value='2'>2</option>
            <option value='3'>3</option>
            <option value='4'>4</option>
          </select>
        </div>
        <div class='form-group my-3'>
          <label for='csv'>Upload CSV file</label>
          <input type='file' class='form-control-file' id='csv' name='csv' required />
          <p>Please make sure that the csv has 3 columns (Register Number, Name, Mail ID)</p>
          <table class='table w-100' id='csvTab'></table>
        </div>
        <div class="btn-group my-3 w-100" role="group">
          <button class='btn btn-secondary text-center' onclick='getClasses()'>Back</button>
          <input type='submit' class='btn btn-dark text-center' />
        </div>
      </form>
  `;
  document.getElementById('main').innerHTML=elements;
  document.getElementById('csv').addEventListener('change', (e) => {
    var fr = new FileReader();
    var tabout = '<tr><th>Register Number</th><th>Name</th><th>Mail ID</th></tr>';
    fr.onload = () => {
      var tab = fr.result;
      var values = tab.split('\n');
      for (let i=1; i<values.length; i++) {
        var r = values[i].split(',');
        tabout+='<tr>'
        for (j in r) {
          tabout+=`<td>${r[j]}</td>`;
        }
        tabdata.push(r);
        tabout+='</tr>';
      }
      document.getElementById('csvTab').innerHTML=tabout;
    }
    fr.readAsText(document.getElementById('csv').files[0]);
  })
  document.getElementById('add-class').addEventListener('submit', async (e) => {
    e.preventDefault();
    var dept = document.getElementById('dept').value;
    var year = document.getElementById('year').value;
    var firestore = firebase.firestore();
    var studCol = firestore.collection(`students/${dept}/${year}`);
    document.getElementById('main').innerHTML=loader;
    for (i in tabdata) {
      await studCol.doc(tabdata[i][0]).set({
        regno: tabdata[i][0],
        name: tabdata[i][1],
        mail: tabdata[i][2] || ''
      })
    }
    alert("Class added successfully");
    getClasses();
  })
}
const addSubject = () => {
  elements = `
    <div class='container'>
      <h3 class='my-3'>Upload Details</h3>
      <form id='add-subject' class='w-100' method='POST'>
        <div class='form-group my-3'>
          <label for='sub'>Subject</label>
          <input type='text' class='form-control' id='sub' name='sub' required />
        </div>
        <div class='form-group my-3'>
          <label for='subsn'>Short Name</label>
          <input type='text' class='form-control' id='subsn' name='subsn' required />
        </div>
        <div class="form-group my-3">
          <label for="dept">Department</label>
          <select id="dept" class="form-control" required>
            <option selected>Select</option>
            <option value='civil'>Civil</option>
            <option value='cse'>CSE</option>
            <option value='ece'>ECE</option>
            <option value='eee'>EEE</option>
            <option value='eie'>EIE</option>
            <option value='ibt'>IBT</option>
            <option value='mech'>Mech</option>
            <option value='prod'>Prod</option>
          </select>
        </div>
        <div class="form-group my-3">
          <label for="year">Year</label>
          <select id="year" class="form-control" required>
            <option selected>Select</option>
            <option value='1'>1</option>
            <option value='2'>2</option>
            <option value='3'>3</option>
            <option value='4'>4</option>
          </select>
        </div>
        <div class="btn-group my-3 w-100" role="group">
          <button class='btn btn-secondary text-center' onclick='getClasses()'>Back</button>
          <input type='submit' class='btn btn-dark text-center' />
        </div>
      </form>
    </div>
  `
  document.getElementById('main').innerHTML = elements;
  document.getElementById('add-subject').addEventListener('submit', (e) => {
    e.preventDefault();
    var dept = document.getElementById('dept').value;
    var sub = document.getElementById('sub').value;
    var subsn = document.getElementById('subsn').value;
    var year = document.getElementById('year').value;
    var docid = `${dept}-${year}-${subsn}`;
    var firestore = firebase.firestore();
    var mail = firebase.auth().currentUser.email;
    firestore.doc(`attendance/${docid}`).set({}).then(() => {
      firestore.doc(`faculties/${mail}`).get().then((doc) => {
        var classes = doc.data().class;
        classes.push({
          dept: dept,
          year: year,
          sub: subsn,
          name: sub,
        })
        firestore.doc(`faculties/${mail}`).update({class: classes}).then((doc) => {
          alert("Subject added successfully");
          getClasses();
        })
      })
    })
  })
}
var att = {};
var subName = "";
const confirmAttendance = () => {
  q = "Confirm the absentees:\n";
  for (i in att) {
    if (att[i]=="a")
    q += i + "\n";
  }
  var choice = confirm(q);
  if (choice) {
    document.getElementById("main").innerHTML=loader
    var db = firebase.firestore();
    var r = {}
    var date = new Date();
    var today = `${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}`;
    r[today] = att;
    db.doc(`attendance/${subName}`).update(r).then(() => {
      alert("Attendance registered successfully");
      getClasses();
    }).catch(e => {
      alert(e);
      checkSignin();
    })
  }
}
const update = (a) => {
  if (att[a]=='a') att[a]='/';
  else att[a]='a';
}
const takeAttendance = () => {
  var firestore = firebase.firestore();
  var selectedClass = "students/"+document.getElementById("classSelection").class.value.split("-")[0]+"/"+document.getElementById("classSelection").class.value.split("-")[1];
  subName = document.getElementById("classSelection").class.value;
  var elements = "<h3 class='text-center my-3'>Select the absentees:</h3><form id='attendance' class='row justify-content-center'><div class='row justify-content-center'>";
  var update = (a) => {
    if (reqAtt[a]=='a') reqAtt[a]='/';
    else reqAtt[a]='a';
  }
  firestore.collection(selectedClass).orderBy("regno", "asc").get().then((a) => {
    a.forEach((doc) => {
      att[doc.data().regno] = "/";
      elements+=`
        <div class="col-6 my-3">
          <input type="checkbox" class="btn-check" id="${doc.data().regno}" value="${doc.data().regno}" autocomplete="off">
          <label class="card btn btn-outline-primary" for="${doc.data().regno}" onclick="update('${doc.data().regno}')">
            <div class="card-body">
              <h5 class="card-title">${doc.data().name}</h5>
              <div class="card-text">${doc.data().regno}</div>
            </div>
          </label>
        </div>
      `
    })
    elements+=`
        </div>
        <div class="btn-group my-3" role="group">
          <button class='btn btn-secondary text-center' onclick='getClasses()'>Back</button>
          <input type='submit' class='btn btn-dark text-center' />
        </div>
      </form>
    `
    document.getElementById('main').innerHTML = elements;
    document.getElementById("attendance").addEventListener("submit", (e) => {
      e.preventDefault();
      confirmAttendance();
    })
  }).catch((e) => {
    alert(e);
    checkSignin();
  })
}
var reqAtt = {};
var subName = "";
const confirmUpdate = () => {
  q = "Confirm the absentees:\n";
  for (i in reqAtt) {
    if (reqAtt[i]=="a")
    q += i + "\n";
  }
  var choice = confirm(q);
  if (choice) {
    document.getElementById("main").innerHTML=loader
    var db = firebase.firestore();
    var r = {}
    var date = new Date();
    var today = `${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}`;
    r[today] = reqAtt;
    db.doc(subName).update(r).then(() => {
      alert("Attendance registered successfully");
      getClasses();
    }).catch(e => {
      alert(e);
      checkSignin();
    })
  }
}
const eUpdate = (a) => {
  if (reqAtt[a]=='a') reqAtt[a]='/';
  else reqAtt[a]='a';
}
const editAttendance = () => {
  var firestore = firebase.firestore();
  subName = "attendance/"+document.getElementById("classSelection").class.value;
  var elements = "<div class='container'><h3 class='text-center my-3'>Select the date:</h3><form id='dateSelect' class='row justify-content-center'>";
  firestore.doc(subName).get().then((doc) => {
    var att = doc.data();
    for (i in att) {
      elements += `
        <input type="radio" class="btn-check" name="date" id="${i}" value="${i}" autocomplete="off">
        <label class="card btn btn-outline-primary p-0 m-1" for="${i}">
          <div class="card-body">
            <h5 class="card-title">${i}</h5>
          </div>
        </label>
      `;
    }
    elements+="<input type='submit' class='btn btn-primary w-50 my-3 text-center fw-bold' value='Confirm' /></form>"
    document.getElementById('main').innerHTML = elements;
    document.getElementById("dateSelect").addEventListener("submit", (e) => {
      e.preventDefault();
      var date = document.getElementById("dateSelect").date.value;
      reqAtt = att[date];
      var elements = "<h3 class='text-center my-3'>Select the absentees:</h3><form id='updateAtt' class='row justify-content-center'><div class='row justify-content-center'>";
      var g = subName.split("/")[1].split("-");
      var dept = g[0];
      var year = g[1];
      document.getElementById('main').innerHTML=loader;
      firestore.collection(`students/${dept}/${year}`).get().then((a) => {
        a.forEach((doc) => {
          var checked = '';
          if (reqAtt[doc.id] == 'a') checked = 'checked';
          elements+=`
            <div class="col-6 my-3">
              <input type="checkbox" class="btn-check" id="${doc.id}" value="${doc.id}" autocomplete="off" ${checked}>
              <label class="card btn btn-outline-primary" for="${doc.id}" onclick="eUpdate('${doc.id}')">
                <div class="card-body">
                  <h5 class="card-title">${doc.data().name}</h5>
                  <div class="card-text">${doc.data().regno}</div>
                </div>
              </label>
            </div>
          `
        })
        elements+="</div><div class='btn-group my-3' role='group'><button class='btn btn-secondary text-center' onclick='getClasses()'>Back</button><input type='submit' class='btn btn-dark text-center' value='Update' /></div></form></div>";
        document.getElementById("main").innerHTML=elements;
        document.getElementById("updateAtt").addEventListener("submit", (e) => {
          e.preventDefault();
          confirmUpdate();
        })
      })
    })
  })
}
var regs = {};  
var names = [];
const downloadAttendance = () => {
  var firestore = firebase.firestore();
  var t = document.getElementById("classSelection").class.value.split("-");
  var dept = t[0];
  var year = t[1];
  subName = document.getElementById("classSelection").class.value;
  firestore.doc("attendance/"+subName).get().then(async (doc) => {
    att = doc.data();
    var dates = Object.keys(att);
    for (i in att[Object.keys(att)[0]]) {
      regs[i] = [];
    }
    for (i in att) {
      var q = att[i];
      for (i in q) {
        regs[i].push(q[i]);
      }
    }
    for (i in regs) {
      await firestore.doc("students/"+dept+"/"+year+"/"+i).get().then((doc) => {
        names.push(doc.data().name);
      })
    }
    var elements = `
      <h3 class='my-3 text-center'>Attendance of ${dept.toUpperCase()} ${year} year for the subject ${subName.toUpperCase()}</h3>
      <div style='overflow:auto'>
      <table class="table table-stripped">  
        <thead>
          <tr>
            <th scope="col">Reg No</th>
            <th scope="col">Name</th>
    `
    for (i in dates) {
      elements+=`
            <th scope="col" style="writing-mode: vertical-rl;text-orientation: mixed;padding:0">${dates[i]}</th>
      `
    }
    elements += `
          </tr>
        </thead>
        <tbody>
    `
    for (i in regs) {
      elements+=`<tr><th scope='row'>${i}</th><th scope="row">${names[Object.keys(regs).indexOf(i)]}</th>`
      for (j in regs[i]) {
        elements += "<td>"+regs[i][j]+"</td>";
      }
      elements += "</tr>"
    }
    elements += "</tbody></table></div>";
    elements += `
      <div class="btn-group my-3" role="group">
        <button class="btn btn-secondary text-center fw-bold" onclick="getClasses()">Back</button>
        <button class='btn btn-dark text-center fw-bold' onclick='window.print()'>Print</button>
      </div>
    `;
    document.getElementById("main").innerHTML=elements;
  })
}
const removeSubject = () => {
  var firestore = firebase.firestore();
  var user = firebase.auth().currentUser;
  var mail = user.email;
  document.getElementById("main").innerHTML=loader;
  var elements = '<div class="container">';
  firestore.doc(`faculties/${mail}`).get().then((r) => {
    elements += `<h3 class="my-3">Select the subjects you want to delete:</h3><form id="rmsub" class="row justify-content-center w-100">`;
    for (i in r.data().class) {
      elements += `
        <input type="radio" class="btn-check" name="class" required id="${r.data().class[i].dept}-${r.data().class[i].year}-${r.data().class[i].sub}" value="${r.data().class[i].dept}-${r.data().class[i].year}-${r.data().class[i].sub}" autocomplete="off">
        <label class="card btn btn-outline-primary p-0 m-3" for="${r.data().class[i].dept}-${r.data().class[i].year}-${r.data().class[i].sub}">
          <div class="card-body">
            <h5 class="card-title">${r.data().class[i].name}</h5>
            <div class="card-text"><b>Year: </b>${r.data().class[i].year} <b>Dept: </b>${r.data().class[i].dept.toUpperCase()}</div>
          </div>
        </label>
      `;
    }
    elements += `
    <div class="btn-group my-3 w-100" role="group">
      <button class='btn btn-secondary text-center' onclick='getClasses()'>Back</button>
      <input type='submit' class='btn btn-dark text-center' />
    </div></form></div>`;
    document.getElementById('main').innerHTML=elements;
    document.getElementById('rmsub').addEventListener('submit', (e) => {
      e.preventDefault();
      subName = document.getElementById("rmsub").class.value;
      document.getElementById("main").innerHTML=loader;
      firestore.doc('attendance/'+subName).delete().then(() => {
        firestore.doc('faculties/'+mail).get().then((doc) => {
          var c = doc.data().class;
          for (i in c) {
            if (c[i].sub == subName.split('-')[2] && c[i].dept == subName.split('-')[0]) {
              c.splice(i, 1);
            }
          }
          firestore.doc('faculties/'+mail).update({class:c}).then(() => {
            alert("Subject Removed Successfully");
            getClasses();
          })
        })
      })
    })
  })
}
const removeClass = () => {
  elements = `
    <div class='container'>
      <h3 class='my-3'>Select the class you want to delete</h3>
      <form id='rmclass' class='w-100' method='POST'>
        <div class="form-group my-3">
          <label for="dept">Department</label>
          <select id="dept" class="form-control" required>
            <option selected>Select</option>
            <option value='civil'>Civil</option>
            <option value='cse'>CSE</option>
            <option value='ece'>ECE</option>
            <option value='eee'>EEE</option>
            <option value='eie'>EIE</option>
            <option value='ibt'>IBT</option>
            <option value='mech'>Mech</option>
            <option value='prod'>Prod</option>
          </select>
        </div>
        <div class="form-group my-3">
          <label for="year">Year</label>
          <select id="year" class="form-control" required>
            <option selected>Select</option>
            <option value='1'>1</option>
            <option value='2'>2</option>
            <option value='3'>3</option>
            <option value='4'>4</option>
          </select>
        </div>
        <div class="btn-group my-3 w-100" role="group">
          <button class='btn btn-secondary text-center' onclick='getClasses()'>Back</button>
          <input type='submit' class='btn btn-dark text-center' />
        </div>
      </form>
    </div>
  `
  document.getElementById('main').innerHTML = elements;
  document.getElementById('rmclass').addEventListener('submit', (e) => {
    e.preventDefault();
    var firestore = firebase.firestore();
    var dept = document.getElementById('dept').value;
    var year = document.getElementById('year').value;
    firestore.collection(`students/${dept}/${year}`).get().then(async (a) => {
      await a.forEach((doc) => {
        firestore.doc(`students/${dept}/${year}/${doc.id}`).delete();
      })
      alert("Class deleted successfully");
      getClasses();
    })
  })
}