<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Family Tree Generator</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
      }

      body {
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        min-height: 100vh;
        padding: 20px;
      }

      .container {
        max-width: 1400px;
        margin: 0 auto;
      }

      header {
        text-align: center;
        margin-bottom: 40px;
        padding: 20px;
        background: white;
        border-radius: 15px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      }

      h1 {
        color: #2c3e50;
        margin-bottom: 10px;
        font-size: 2.5em;
      }

      .subtitle {
        color: #7f8c8d;
        font-size: 1.1em;
      }

      .main-content {
        display: flex;
        gap: 30px;
        flex-wrap: wrap;
      }

      .control-panel {
        flex: 1;
        min-width: 300px;
        background: white;
        padding: 25px;
        border-radius: 15px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      }

      .tree-container {
        flex: 2;
        min-width: 600px;
        background: white;
        padding: 25px;
        border-radius: 15px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        min-height: 600px;
        overflow: auto;
      }

      .form-group {
        margin-bottom: 20px;
      }

      label {
        display: block;
        margin-bottom: 8px;
        color: #2c3e50;
        font-weight: 600;
      }

      input,
      select {
        width: 100%;
        padding: 12px;
        border: 2px solid #ddd;
        border-radius: 8px;
        font-size: 16px;
        transition: border-color 0.3s;
      }

      input:focus,
      select:focus {
        outline: none;
        border-color: #3498db;
      }

      .btn {
        background: #3498db;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 16px;
        font-weight: 600;
        transition: all 0.3s;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .btn:hover {
        background: #2980b9;
        transform: translateY(-2px);
      }

      .btn-danger {
        background: #e74c3c;
      }

      .btn-danger:hover {
        background: #c0392b;
      }

      .btn-success {
        background: #2ecc71;
      }

      .btn-success:hover {
        background: #27ae60;
      }

      .buttons {
        display: flex;
        gap: 10px;
        margin-top: 20px;
      }

      .buttons .btn {
        flex: 1;
      }

      #familyTree {
        position: relative;
        min-height: 500px;
      }

      .person {
        position: absolute;
        padding: 15px;
        background: white;
        border-radius: 10px;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
        text-align: center;
        min-width: 120px;
        cursor: move;
        transition: transform 0.3s;
        border: 3px solid #3498db;
      }

      .person:hover {
        transform: scale(1.05);
        z-index: 100;
      }

      .person.male {
        border-color: #3498db;
        background: #e3f2fd;
      }

      .person.female {
        border-color: #e91e63;
        background: #fce4ec;
      }

      .person-name {
        font-weight: 600;
        font-size: 16px;
        margin-bottom: 5px;
        color: #2c3e50;
      }

      .person-details {
        font-size: 12px;
        color: #7f8c8d;
      }

      .connector {
        position: absolute;
        background: #7f8c8d;
      }

      .generation {
        font-size: 14px;
        color: #95a5a6;
        font-style: italic;
      }

      .instructions {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 8px;
        margin-top: 20px;
        font-size: 14px;
        color: #666;
        border-left: 4px solid #3498db;
      }

      .instructions h3 {
        margin-bottom: 10px;
        color: #2c3e50;
      }

      .instructions ul {
        padding-left: 20px;
      }

      .instructions li {
        margin-bottom: 5px;
      }

      .export-buttons {
        display: flex;
        gap: 10px;
        margin-top: 15px;
      }

      @media (max-width: 1024px) {
        .main-content {
          flex-direction: column;
        }

        .tree-container,
        .control-panel {
          min-width: 100%;
        }
      }

      .tree-stats {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 8px;
        margin-top: 20px;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 10px;
      }

      .stat-item {
        text-align: center;
        padding: 10px;
      }

      .stat-value {
        font-size: 24px;
        font-weight: bold;
        color: #3498db;
      }

      .stat-label {
        font-size: 12px;
        color: #7f8c8d;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
    </style>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
    />
  </head>
  <body>
    <div class="container">
      <header>
        <h1><i class="fas fa-tree"></i> Family Tree Generator</h1>
        <p class="subtitle">Visualize and document your family history</p>
      </header>

      <div class="main-content">
        <div class="control-panel">
          <h2><i class="fas fa-user-plus"></i> Add Family Member</h2>

          <div class="form-group">
            <label for="name"><i class="fas fa-signature"></i> Full Name</label>
            <input type="text" id="name" placeholder="Enter full name" />
          </div>

          <div class="form-group">
            <label for="gender"><i class="fas fa-venus-mars"></i> Gender</label>
            <select id="gender">
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div class="form-group">
            <label for="birthYear"
              ><i class="fas fa-birthday-cake"></i> Birth Year</label
            >
            <input
              type="number"
              id="birthYear"
              placeholder="e.g., 1985"
              min="1900"
              max="2024"
            />
          </div>

          <div class="form-group">
            <label for="parent"><i class="fas fa-users"></i> Parent</label>
            <select id="parent">
              <option value="none">None (Root person)</option>
            </select>
          </div>

          <div class="buttons">
            <button class="btn" id="addPerson">
              <i class="fas fa-plus"></i> Add Person
            </button>
            <button class="btn btn-success" id="generateTree">
              <i class="fas fa-project-diagram"></i> Generate Tree
            </button>
          </div>

          <div class="tree-stats" id="treeStats">
            <div class="stat-item">
              <div class="stat-value" id="totalPeople">0</div>
              <div class="stat-label">Total People</div>
            </div>
            <div class="stat-item">
              <div class="stat-value" id="generations">0</div>
              <div class="stat-label">Generations</div>
            </div>
            <div class="stat-item">
              <div class="stat-value" id="maleCount">0</div>
              <div class="stat-label">Male</div>
            </div>
            <div class="stat-item">
              <div class="stat-value" id="femaleCount">0</div>
              <div class="stat-label">Female</div>
            </div>
          </div>
        </div>

        <div class="tree-container">
          <h2>
            <i class="fas fa-network-wired"></i> Family Tree Visualization
          </h2>
          <div id="familyTree">
            <p style="text-align: center; color: #95a5a6; margin-top: 50px">
              Add family members to see your tree visualized here
            </p>
          </div>
        </div>
      </div>
    </div>

    <script>
      class FamilyTree {
        constructor() {
          this.people = [];
          this.nextId = 1;
          this.init();
        }

        init() {
          this.loadFromStorage();
          this.bindEvents();
          this.updateParentDropdown();
          this.updateStats();
        }

        bindEvents() {
          document
            .getElementById("addPerson")
            .addEventListener("click", () => this.addPerson());
          document
            .getElementById("generateTree")
            .addEventListener("click", () => this.generateTree());




          // Enter key support
          document.getElementById("name").addEventListener("keypress", (e) => {
            if (e.key === "Enter") this.addPerson();
          });
        }

        addPerson() {
          const name = document.getElementById("name").value.trim();
          const gender = document.getElementById("gender").value;
          const birthYear = document.getElementById("birthYear").value;
          const parentId = document.getElementById("parent").value;

          if (!name) {
            alert("Please enter a name");
            return;
          }

          const person = {
            id: this.nextId++,
            name: name,
            gender: gender,
            birthYear: birthYear || "Unknown",
            parentId: parentId === "none" ? null : parseInt(parentId),
            children: [],
            x: 0,
            y: 0,
          };

          this.people.push(person);

          if (parentId !== "none") {
            const parent = this.people.find((p) => p.id === parseInt(parentId));
            if (parent) {
              parent.children.push(person.id);
            }
          }

          // Clear form
          document.getElementById("name").value = "";
          document.getElementById("birthYear").value = "";

          this.updateParentDropdown();
          this.saveToStorage();
          this.updateStats();

          alert(`${name} added to the family tree!`);
        }

        updateParentDropdown() {
          const select = document.getElementById("parent");
          select.innerHTML = '<option value="none">None (Root person)</option>';

          this.people.forEach((person) => {
            const option = document.createElement("option");
            option.value = person.id;
            option.textContent = `${person.name} (${person.gender})`;
            select.appendChild(option);
          });
        }

        generateTree() {
          const container = document.getElementById("familyTree");
          container.innerHTML = "";

          if (this.people.length === 0) {
            container.innerHTML =
              '<p style="text-align: center; color: #95a5a6; margin-top: 50px;">Add family members to see your tree visualized here</p>';
            return;
          }

          // Find root people (those without parents)
          const roots = this.people.filter((person) => !person.parentId);

          // Position nodes
          this.positionNodes(roots, container.offsetWidth / 2, 100, 200, 150);

          // Draw connectors
          this.drawConnectors();

          // Make nodes draggable
          this.makeDraggable();
        }

        positionNodes(people, x, y, xSpacing, ySpacing) {
          if (people.length === 0) return;

          const container = document.getElementById("familyTree");

          // حساب العرض الكلي المطلوب للأبناء
          const calculateWidth = (person) => {
            const children = this.people.filter(
              (p) => p.parentId === person.id
            );
            if (children.length === 0) return 1;

            let totalWidth = 0;
            children.forEach((child) => {
              totalWidth += calculateWidth(child);
            });
            return Math.max(totalWidth, children.length);
          };

          // توزيع الأشخاص بشكل متساوي
          let currentX = x - (xSpacing * (people.length - 1)) / 2;

          people.forEach((person) => {
            // تعيين موقع الشخص
            person.x = currentX;
            person.y = y;

            // إنشاء عنصر HTML للشخص
            const personElement = this.createPersonElement(person);
            container.appendChild(personElement);

            // تحديث الموضع للعرض التالي
            const personWidth = calculateWidth(person);
            currentX += personWidth * xSpacing;

            // رسم الأبناء بشكل متكرر
            const children = this.people.filter(
              (p) => p.parentId === person.id
            );
            if (children.length > 0) {
              this.positionNodes(
                children,
                person.x,
                y + ySpacing,
                xSpacing * 0.8,
                ySpacing
              );
            }
          });
        }

        createPersonElement(person) {
          const personElement = document.createElement("div");
          personElement.className = `person ${person.gender}`;
          personElement.id = `person-${person.id}`;
          personElement.dataset.id = person.id;

          // حساب العمر إذا كان هناك سنة ميلاد
          let ageInfo = "";
          if (person.birthYear !== "Unknown" && !isNaN(person.birthYear)) {
            const age = new Date().getFullYear() - parseInt(person.birthYear);
            ageInfo = `Age: ${age}`;
          }

          personElement.innerHTML = `
        <div class="person-name">${person.name}</div>
        <div class="person-details">
            ${
              person.gender.charAt(0).toUpperCase() + person.gender.slice(1)
            }<br>
            Born: ${person.birthYear}<br>
            ${ageInfo}
        </div>
    `;

          // تعيين الموضع
          personElement.style.left = `${person.x}px`;
          personElement.style.top = `${person.y}px`;

          return personElement;
        }

        drawConnectors() {
          const container = document.getElementById("familyTree");

          // إزالة أي خطوط قديمة
          const oldConnectors = container.querySelectorAll(".connector");
          oldConnectors.forEach((c) => c.remove());

          this.people.forEach((parent) => {
            const children = this.people.filter(
              (child) => child.parentId === parent.id
            );

            children.forEach((child) => {
              const parentEl = document.getElementById(`person-${parent.id}`);
              const childEl = document.getElementById(`person-${child.id}`);

              if (parentEl && childEl) {
                const parentRect = parentEl.getBoundingClientRect();
                const childRect = childEl.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();

                const x1 =
                  parentRect.left + parentRect.width / 2 - containerRect.left;
                const y1 = parentRect.bottom - containerRect.top;
                const x2 =
                  childRect.left + childRect.width / 2 - containerRect.left;
                const y2 = childRect.top - containerRect.top;

                const length = Math.sqrt(
                  Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)
                );
                const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;

                const connector = document.createElement("div");
                connector.className = "connector";
                connector.style.width = `${length}px`;
                connector.style.height = "2px";
                connector.style.left = `${x1}px`;
                connector.style.top = `${y1}px`;
                connector.style.background = "#7f8c8d";
                connector.style.transform = `rotate(${angle}deg)`;
                connector.style.transformOrigin = "0 0";

                // رأس السهم في النهاية
                const arrowHead = document.createElement("div");
                arrowHead.style.position = "absolute";
                arrowHead.style.right = "0";
                arrowHead.style.top = "-4px";
                arrowHead.style.width = "0";
                arrowHead.style.height = "0";
                arrowHead.style.borderLeft = "6px solid transparent";
                arrowHead.style.borderRight = "6px solid transparent";
                arrowHead.style.borderTop = "8px solid #7f8c8d";
                connector.appendChild(arrowHead);

                container.appendChild(connector);
              }
            });
          });
        }

        makeDraggable() {
          const peopleElements = document.querySelectorAll(".person");
          let activeElement = null;
          let offsetX = 0,
            offsetY = 0;

          peopleElements.forEach((el) => {
            el.addEventListener("mousedown", startDrag);
            el.addEventListener("touchstart", startDragTouch);
          });

          function startDrag(e) {
            activeElement = this;
            const rect = this.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            document.addEventListener("mousemove", drag);
            document.addEventListener("mouseup", stopDrag);
            e.preventDefault();
          }

          function startDragTouch(e) {
            activeElement = e.target.closest(".person");
            const rect = activeElement.getBoundingClientRect();
            offsetX = e.touches[0].clientX - rect.left;
            offsetY = e.touches[0].clientY - rect.top;

            document.addEventListener("touchmove", dragTouch);
            document.addEventListener("touchend", stopDrag);
            e.preventDefault();
          }

          function drag(e) {
            if (!activeElement) return;

            const container = document.getElementById("familyTree");
            const containerRect = container.getBoundingClientRect();

            let x = e.clientX - containerRect.left - offsetX;
            let y = e.clientY - containerRect.top - offsetY;

            // Keep within bounds
            x = Math.max(
              0,
              Math.min(x, containerRect.width - activeElement.offsetWidth)
            );
            y = Math.max(
              0,
              Math.min(y, containerRect.height - activeElement.offsetHeight)
            );

            activeElement.style.left = `${x}px`;
            activeElement.style.top = `${y}px`;

            // Update person position data
            const personId = parseInt(activeElement.dataset.id);
            const person = familyTree.people.find((p) => p.id === personId);
            if (person) {
              person.x = x;
              person.y = y;
            }

            // Redraw connectors
            const connectors = document.querySelectorAll(".connector");
            connectors.forEach((c) => c.remove());
            familyTree.drawConnectors();
          }

          function dragTouch(e) {
            if (!activeElement || !e.touches[0]) return;

            const container = document.getElementById("familyTree");
            const containerRect = container.getBoundingClientRect();

            let x = e.touches[0].clientX - containerRect.left - offsetX;
            let y = e.touches[0].clientY - containerRect.top - offsetY;

            x = Math.max(
              0,
              Math.min(x, containerRect.width - activeElement.offsetWidth)
            );
            y = Math.max(
              0,
              Math.min(y, containerRect.height - activeElement.offsetHeight)
            );

            activeElement.style.left = `${x}px`;
            activeElement.style.top = `${y}px`;

            const personId = parseInt(activeElement.dataset.id);
            const person = familyTree.people.find((p) => p.id === personId);
            if (person) {
              person.x = x;
              person.y = y;
            }

            const connectors = document.querySelectorAll(".connector");
            connectors.forEach((c) => c.remove());
            familyTree.drawConnectors();
          }

          function stopDrag() {
            activeElement = null;
            document.removeEventListener("mousemove", drag);
            document.removeEventListener("mouseup", stopDrag);
            document.removeEventListener("touchmove", dragTouch);
            document.removeEventListener("touchend", stopDrag);
            familyTree.saveToStorage();
          }
        }

        updateStats() {
          document.getElementById("totalPeople").textContent =
            this.people.length;

          // Calculate generations
          let maxGeneration = 0;
          this.people.forEach((person) => {
            let generation = 1;
            let current = person;
            while (current.parentId) {
              generation++;
              current = this.people.find((p) => p.id === current.parentId);
              if (!current) break;
            }
            maxGeneration = Math.max(maxGeneration, generation);
          });
          document.getElementById("generations").textContent = maxGeneration;

          // Count genders
          const maleCount = this.people.filter(
            (p) => p.gender === "male"
          ).length;
          const femaleCount = this.people.filter(
            (p) => p.gender === "female"
          ).length;
          document.getElementById("maleCount").textContent = maleCount;
          document.getElementById("femaleCount").textContent = femaleCount;
        }

        clearTree() {
          if (
            confirm("Are you sure you want to clear the entire family tree?")
          ) {
            this.people = [];
            this.nextId = 1;
            localStorage.removeItem("familyTreeData");
            this.generateTree();
            this.updateParentDropdown();
            this.updateStats();
          }
        }

        saveToStorage() {
          const data = {
            people: this.people,
            nextId: this.nextId,
          };
          localStorage.setItem("familyTreeData", JSON.stringify(data));
        }

        loadFromStorage() {
          const data = localStorage.getItem("familyTreeData");
          if (data) {
            const parsed = JSON.parse(data);
            this.people = parsed.people;
            this.nextId = parsed.nextId;
            this.generateTree();
          }
        }

      }

      // Initialize the family tree
      const familyTree = new FamilyTree();
    </script>
  </body>
</html>
