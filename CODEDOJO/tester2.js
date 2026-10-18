
    
    
  const arr = [
  { id: 45, name: "Assembly" }, { id: 46, name: "Bash" }, { id: 47, name: "Basic" },
  { id: 50, name: "C" }, { id: 54, name: "C++" }, { id: 51, name: "C#" },
  { id: 55, name: "Common Lisp" }, { id: 56, name: "D" }, { id: 57, name: "Elixir" },
  { id: 58, name: "Erlang" }, { id: 44, name: "Executable" }, { id: 59, name: "Fortran" },
  { id: 60, name: "Go" }, { id: 61, name: "Haskell" }, { id: 62, name: "Java" },
  { id: 63, name: "JavaScript" }, { id: 64, name: "Lua" }, { id: 65, name: "OCaml" },
  { id: 66, name: "Octave" }, { id: 67, name: "Pascal" }, { id: 68, name: "PHP" },
  { id: 43, name: "Plain Text" }, { id: 69, name: "Prolog" }, { id: 71, name: "Python" },
  { id: 72, name: "Ruby" }, { id: 73, name: "Rust" }, { id: 74, name: "TypeScript" }
];


function fetchIdByName(name) {
  return arr.find(item => item.name.toLowerCase() === name.toLowerCase())?.id ?? 0;
}

   export default fetchIdByName;