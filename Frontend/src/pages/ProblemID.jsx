import { useParams } from "react-router";
import axiosInstance from "../utils/axios.js";
import { useEffect, useState } from "react";
import {  useSelector } from 'react-redux';
import { useForm } from "react-hook-form"
import Editor from "react-simple-code-editor";
import SyntaxHighlighter from 'react-syntax-highlighter';
import ChatAi from "./chatAi.jsx";
import { ReactComponent as Logo } from '../assets/codedojo.svg'
import Example from "./example.jsx";

import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

function ProblemPage() {
  const { id } = useParams();

  const [problem, setProblem] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [code, setCode] = useState("");
  const [runResults, setRunResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
   const { user } = useSelector((state) => state.auth);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReference, setShowReference] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showEditorial, setShowEditorial] = useState(false); // New state for editorial
  const [editorialVideo, setEditorialVideo] = useState(null); // Store video data
  const [isLoadingEditorial, setIsLoadingEditorial] = useState(false); // Loading state

  // Map language to syntax highlighter language
  const getHighlighterLanguage = (lang) => {
    const languageMap = {
      javascript: "javascript",
      python: "python",
      java: "java",
      cpp: "cpp",
      c: "c",
      csharp: "csharp",
      typescript: "typescript",
      go: "go",
      rust: "rust",
      ruby: "ruby",
      php: "php",
      swift: "swift",
      kotlin: "kotlin",
    };
    return languageMap[lang?.toLowerCase()] || "javascript";
  };

  // Fetch problem
  const fetchProblem = async () => {
    try {
      const response = await axiosInstance.get(`/problem/${id}`);
      const data = response.data.problem;

      setProblem(data);

      const langs = data.startCode?.map(item => item.language) || [];
      setLanguages(langs);

      if (langs.length > 0) {
        const firstLang = langs[0];
        setSelectedLanguage(firstLang);

        const starter = data.startCode.find(
          c => c.language === firstLang
        )?.initialCode || "";

        setCode(starter);
      }

    } catch (err) {
      console.error(err);
    }
  };

  // Editor key handling: block pairs for ({[ place closing on next line), inline quotes, Tab, and smart Enter
  const handleEditorKeyDown = (e) => {
    const blockPairs = { '(': ')', '[': ']', '{': '}' };
    const inlinePairs = { '"': '"', "'": "'", '`': '`' };
    const start = e.target.selectionStart;
    const end = e.target.selectionEnd;

    // Tab -> insert two spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const tab = '  ';
      const newCode = code.slice(0, start) + tab + code.slice(end);
      setCode(newCode);
      setTimeout(() => {
        const ta = e.target;
        ta.selectionStart = ta.selectionEnd = start + tab.length;
      }, 0);
      return;
    }

    // Block pairs: when typing an opening bracket, place closing on the next line
    if (blockPairs[e.key]) {
      e.preventDefault();
      const closing = blockPairs[e.key];
      const lineStart = code.lastIndexOf('\n', start - 1) + 1;
      const currentIndent = (code.slice(lineStart, start).match(/^\s*/) || [''])[0];
      const innerIndent = currentIndent + '  ';
      const insertMiddle = '\n' + innerIndent;
      const insertAfter = '\n' + currentIndent + closing;
      const newCode = code.slice(0, start) + e.key + insertMiddle + insertAfter + code.slice(end);
      setCode(newCode);
      setTimeout(() => {
        const ta = e.target;
        ta.selectionStart = ta.selectionEnd = start + 1 + insertMiddle.length;
      }, 0);
      return;
    }

    // Inline pairs (quotes) -> insert pair and place cursor between
    if (inlinePairs[e.key]) {
      e.preventDefault();
      const closing = inlinePairs[e.key];
      const newCode = code.slice(0, start) + e.key + closing + code.slice(end);
      setCode(newCode);
      setTimeout(() => {
        const ta = e.target;
        ta.selectionStart = ta.selectionEnd = start + 1;
      }, 0);
      return;
    }

    // If typing a closing char that already exists at cursor, jump over it
    if (Object.values(blockPairs).concat(Object.values(inlinePairs)).includes(e.key)) {
      if (code[start] === e.key) {
        e.preventDefault();
        setTimeout(() => {
          const ta = e.target;
          ta.selectionStart = ta.selectionEnd = start + 1;
        }, 0);
      }
      return;
    }

    // Smart Enter: keep indentation and add extra indent after opening brace
    if (e.key === 'Enter') {
      e.preventDefault();
      const lineStart = code.lastIndexOf('\n', start - 1) + 1;
      const currentIndent = (code.slice(lineStart, start).match(/^\s*/) || [''])[0];
      const prevChar = code[start - 1];
      const shouldAddExtra = prevChar === '{' || prevChar === '[' || prevChar === '(';
      const insert = '\n' + currentIndent + (shouldAddExtra ? '  ' : '');
      const closingInsert = shouldAddExtra ? '\n' + currentIndent : '';
      const newCode = code.slice(0, start) + insert + closingInsert + code.slice(end);
      setCode(newCode);
      setTimeout(() => {
        const ta = e.target;
        ta.selectionStart = ta.selectionEnd = start + insert.length;
      }, 0);
      return;
    }
  };

  // Fetch editorial video
  const fetchEditorialVideo = async () => {
    if (!id) return;
    
    setIsLoadingEditorial(true);
    try {
      const response = await axiosInstance.get(`/video/fetch/${id}`);
      setEditorialVideo(response.data);
      setShowEditorial(true); // Open the modal when video is fetched
    } catch (err) {
      console.error("Error fetching editorial video:", err);
      
      // Show error toast
      const toast = document.createElement('div');
      toast.className = 'toast toast-top toast-center z-50';
      toast.innerHTML = `
        <div class="alert alert-error shadow-2xl border border-error/20 bg-white text-black">
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-error flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span class="font-medium">No editorial video available for this problem</span>
          </div>
        </div>
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
      
      setEditorialVideo(null);
    } finally {
      setIsLoadingEditorial(false);
    }
  };

  useEffect(() => {
    fetchProblem();
  }, [id]);

  useEffect(() => {
    if (problem && selectedLanguage) {
      const starter = problem.startCode?.find(
        c => c.language === selectedLanguage
      )?.initialCode || "";

      setCode(starter);
    }
  }, [selectedLanguage, problem]);

  const handleRunCode = async () => {
    setIsRunning(true);
    try {
      const response = await axiosInstance.post(`/submission/run/${id}`, {
     code :
    
       (problem?.twrapp?.[0]?.code ?? " ") +
code +
(problem?.bwrapp?.[0]?.code ?? " ") 
       ,
        language: selectedLanguage
      });
      setRunResults(response.data.message || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const totalTests = runResults?.length || 0;
  const passedTests = runResults?.filter(r => r.status?.id === 3).length || 0;
  const failedTests = totalTests - passedTests;

  const getStatusText = (id) => {
    switch (id) {
      case 3: return "Accepted";
      case 4: return "Wrong Answer";
      case 5: return "Time Limit Exceeded";
      case 6: return "Compilation Error";
      case 7: return "Runtime Error";
      default: return "Processing";
    }
  };

  const getStatusColorClass = (id) => {
    switch (id) {
      case 3: return "alert-success";
      case 4: return "alert-error";
      case 5: return "alert-warning";
      case 6: return "alert-error";
      case 7: return "alert-error";
      default: return "alert-info";
    }
  };

     const handleSubmitSolution = async () => {
    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post(`/submission/submit/${id}`, {
      code :
       (problem?.twrapp?.[0]?.code ?? " ") +
code +
(problem?.bwrapp?.[0]?.code ?? " ") 
       ,
        language: selectedLanguage
      });

      const toast = document.createElement('div');
      toast.className = 'toast toast-top toast-center z-50';
      toast.innerHTML = `
        <div class="alert alert-success shadow-2xl border border-success/20 bg-white text-black">
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-success flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span class="font-medium">${response?.data?.message || "Submission completed successfully!"}</span>
          </div>
        </div>
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);

    } catch (err) {
      console.error(err);
      const toast = document.createElement('div');
      toast.className = 'toast toast-top toast-center z-50';
      toast.innerHTML = `
        <div class="alert alert-error shadow-2xl border border-error/20 bg-white text-black">
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-error flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span class="font-medium">Submission failed. Please try again.</span>
          </div>
        </div>
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // CONSTANTS FOR STYLING TO ENSURE ALIGNMENT
  const editorFontFamily = '"JetBrains Mono", "Fira Code", monospace';
  const editorFontSize = 14;
  const editorLineHeight = 1.5; // 150%

  // Custom highlight function for the editor
  const highlightCode = (code) => {
    if (!code) return '';
    const language = getHighlighterLanguage(selectedLanguage);
    return (
      <SyntaxHighlighter
        language={language}
        style={atomDark}
        customStyle={{
          margin: 0,
          padding: 0,
          background: 'transparent',
          fontSize: `${editorFontSize}px`,
          fontFamily: editorFontFamily,
          lineHeight: editorLineHeight,
        }}
        wrapLines={true}
        wrapLongLines={true}
        codeTagProps={{
          style: { 
            fontFamily: editorFontFamily,
            fontSize: `${editorFontSize}px`,
            lineHeight: editorLineHeight,
          }
        }}
      >
        {code}
      </SyntaxHighlighter>
    );
  };

  // Format duration to remove milliseconds
  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Decode base64 strings from judge API
  const decodeBase64 = (str) => {
    if (!str) return '';
    try {
      return atob(str);
    } catch (err) {
      return str; // Return original if decode fails
    }
  };

  // Format code function
  const handleFormatCode = async () => {
    try {
      // Check if prettier is available
      if (window.prettier && window.prettierPlugins) {
        let formattedCode = code;
        const lang = selectedLanguage.toLowerCase();
        
        let parserName = 'babel'; // default
        if (lang === 'python') parserName = 'python';
        else if (lang === 'java') parserName = 'java';
        else if (lang === 'cpp' || lang === 'c') parserName = 'cpp';
        else if (lang === 'typescript') parserName = 'typescript';
        
        try {
          formattedCode = await window.prettier.format(code, {
            parser: parserName,
            plugins: window.prettierPlugins,
          });
        } catch (err) {
          console.log('Prettier format failed, using basic formatting:', err);
          formattedCode = basicFormat(code);
        }
        
        setCode(formattedCode);
      } else {
        // Fallback to basic formatting
        setCode(basicFormat(code));
      }
    } catch (err) {
      console.error('Format error:', err);
      // Show error toast
      const toast = document.createElement('div');
      toast.className = 'toast toast-top toast-center z-50';
      toast.innerHTML = `
        <div class="alert alert-error shadow-2xl border border-error/20 bg-white text-black">
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-error flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span class="font-medium">Format failed. Check code syntax.</span>
          </div>
        </div>
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }
  };

  // Basic code formatting (fallback)
  const basicFormat = (codeStr) => {
    const lines = codeStr.split('\n');
    let indentLevel = 0;
    const indentStr = '  ';
    
    const formattedLines = lines.map(line => {
      const trimmed = line.trim();
      
      // Skip empty lines
      if (!trimmed) return '';
      
      // Decrease indent for closing brackets
      if (trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      const formattedLine = indentStr.repeat(indentLevel) + trimmed;
      
      // Increase indent for opening brackets
      if (trimmed.endsWith('{') || trimmed.endsWith('[') || trimmed.endsWith('(')) {
        indentLevel++;
      }
      
      return formattedLine;
    });
    
    return formattedLines.join('\n');
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-gray-300 font-sans selection:bg-cyan-500/30" data-theme="black">
      
      {/* NAVBAR */}
      <div className="navbar h-24 bg-[#0f1117]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50 px-6">
        <div className="flex items-center gap-4">
          {/* BIGGER SVG LOGO */}
          <div className="h-24 w-40 relative flex items-center justify-center overflow-visible">
  
            <Logo/>
          </div>

          {/* Centered Text */}
          <span className="text-[25px] font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 tracking-wide" style={{ fontFamily: 'typo-round, sans-serif' }}>
            CodeDojo
          </span>
        </div>
      </div>

      {/* Editorial Video Modal */}
      {showEditorial && editorialVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1e1e1e] rounded-lg w-11/12 max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-white/10">
            {/* Modal Header */}
            <div className="bg-[#21262d] px-6 py-4 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-white">
                  {problem?.title || "Problem Tutorial"} - Editorial
                </h3>
                {editorialVideo.duration && (
                  <span className="text-xs text-gray-400 bg-black/30 px-2 py-1 rounded">
                    {formatDuration(editorialVideo.duration)}
                  </span>
                )}
              </div>
              <button 
                className="btn btn-sm btn-ghost text-gray-400 hover:text-white"
                onClick={() => setShowEditorial(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            {/* Video Player */}
            <div className="p-6">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <video 
                  key={editorialVideo.secureUrl}
                  className="w-full h-full"
                  controls
                  autoPlay
                  poster={editorialVideo.thumbnailUrl}
                >
                  <source src={editorialVideo.secureUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:h-[calc(100vh-6rem)]">
        
        {/* LEFT PANEL: Problem Description */}
        <div className="bg-[#0f1117] border-r border-white/5 overflow-y-auto custom-scrollbar p-8">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-4 gap-4">
                <h1 className="text-3xl font-bold text-white tracking-tight leading-tight">
                  {problem?.title || <span className="loading loading-spinner loading-md"></span>}
                </h1>
                {problem?.difficulty && (
                  <div className={`badge badge-lg border-none whitespace-nowrap ${
                    problem.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' : 
                    problem.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {problem.difficulty}
                  </div>
                )}
              </div>
              <div className="h-0.5 w-20 bg-gradient-to-r from-cyan-500 to-transparent mb-6"></div>
            </div>

            {/* Description Body - Always visible */}
            <article className="prose prose-invert prose-p:text-gray-300 prose-headings:text-gray-100 max-w-none">
              <p className="leading-relaxed text-lg">
                {problem?.description || "Loading description..."}
              </p>
            </article>

            {/* Conditionally show Examples or Chat based on showChat state */}
            {!showChat ? (
              // Examples Section
              <>
         
                <Example problem={problem} />
                
           
          
              </>
            ) : (
              // Chat Section - Simple placeholder
                           

   
    

              <>
   {showChat && problem && (
  <ChatAi problem={problem} code={code} emailID={user.emailID} />
)}
 
       </>     )}
          </div>
        </div>

        {/* RIGHT PANEL: Editor */}
        <div className="flex flex-col bg-[#272822] border-l border-white/5 h-[80vh] lg:h-auto overflow-hidden">
          
          {/* Toolbar */}
          <div className="h-14 bg-[#3e3d32] border-b border-black/40 flex items-center justify-between px-6 shadow-sm z-10">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5 mr-4">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
              </div>
             
            </div>
            
            <div className="flex items-center gap-2">
              {/* Format Button */}
              <button
                className="btn btn-xs bg-orange-600 border-none text-white hover:bg-orange-700 transition-colors"
                onClick={handleFormatCode}
                disabled={!code}
                title="Format Code"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1">
                  <path d="M3 6h18M3 12h18M3 18h18M8 3v18M16 3v18"></path>
                </svg>
                Format
              </button>

              {/* NEW: Editorial Button - Positioned left of ChatAI */}
              <button
                className={`btn btn-xs ${isLoadingEditorial ? 'loading' : ''} bg-purple-600 border-none text-white hover:bg-purple-700 transition-colors`}
                onClick={fetchEditorialVideo}
                disabled={isLoadingEditorial}
                title="View Editorial Solution"
              >
                {!isLoadingEditorial && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1">
                    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                    <line x1="8" y1="2" x2="8" y2="22"></line>
                    <line x1="16" y1="2" x2="16" y2="22"></line>
                    <line x1="2" y1="8" x2="22" y2="8"></line>
                    <line x1="2" y1="16" x2="22" y2="16"></line>
                  </svg>
                )}
                Editorial
              </button>

              {/* ChatAI Button */}
              <button
                className={`btn btn-xs ${showChat ? 'bg-cyan-600' : 'bg-gray-700'} border-none text-white hover:bg-cyan-700 transition-colors`}
                onClick={() => setShowChat(!showChat)}
                title="Toggle AI Chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                ChatAI
              </button>

              {/* Reference Solution Toggle Button */}
              <button
                className={`btn btn-xs ${showReference ? 'bg-indigo-600' : 'bg-gray-700'} border-none text-white hover:bg-indigo-700 transition-colors`}
                onClick={() => setShowReference(!showReference)}
                title="Toggle Reference Solution"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
                {showReference ? 'Hide' : 'Show'} Reference
              </button>
              
              <select 
                className="select select-xs w-36 bg-[#3e3d32] text-gray-200 border-none focus:outline-none rounded font-mono"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                {languages.map((lang, index) => (
                  <option key={index} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* EDITOR AREA */}
          <div className="flex-1 relative bg-[#272822] flex group overflow-hidden">
            
            {/* LINE NUMBERS */}
            <div 
              className="bg-[#272822] border-r border-[#3e3d32] flex flex-col items-end pt-[24px] pr-4 pb-4 select-none z-10 w-14 flex-shrink-0"
              style={{
                fontFamily: editorFontFamily,
                fontSize: `${editorFontSize}px`,
                lineHeight: editorLineHeight,
              }}
            >
              {code.split('\n').map((_, i) => (
                <div key={i} className="text-[#75715e] hover:text-[#f8f8f2]">{i + 1}</div>
              ))}
            </div>

            {/* CODE EDITOR */}
            <div className="flex-1 relative overflow-auto custom-scrollbar bg-[#272822]">
              <Editor
                value={code}
                onValueChange={setCode}
                highlight={highlightCode}
                padding={24}
                className="editor-wrapper"
                style={{
                  fontFamily: editorFontFamily,
                  fontSize: editorFontSize,
                  lineHeight: editorLineHeight,
                  minHeight: '100%',
                  backgroundColor: '#272822',
                }}
                textareaClassName="code-area-textarea focus:outline-none text-transparent caret-white"
                textareaProps={{ onKeyDown: handleEditorKeyDown, spellCheck: false, autoCorrect: 'off', autoCapitalize: 'off' }}
                disabled={!selectedLanguage}
              />
            </div>
          </div>

          {/* Reference Solution Panel */}
          {showReference && (
            <div className="bg-[#272822] border-t border-white/10">
              <div className="bg-[#3e3d32] px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Reference Solution ({selectedLanguage})</span>
                  <button 
                    className="btn btn-xs btn-ghost text-gray-400 hover:text-white"
                    onClick={() => setShowReference(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <span className="text-xs text-gray-500">Reference implementation</span>
              </div>
              <div className="p-4 max-h-60 overflow-auto custom-scrollbar">
                <SyntaxHighlighter
                  language={getHighlighterLanguage(selectedLanguage)}
                  style={atomDark}
                  customStyle={{
                    margin: 0,
                    padding: '16px',
                    background: '#272822',
                    borderRadius: '8px',
                    fontSize: `${editorFontSize}px`,
                    fontFamily: editorFontFamily,
                    lineHeight: editorLineHeight,
                  }}
                  wrapLines={true}
                  wrapLongLines={true}
                >
                  {problem?.referenceSolution?.find(ref => ref.language === selectedLanguage)?.completeCode || '// No reference solution available for this language'}
                </SyntaxHighlighter>
              </div>
            </div>
          )}

          {/* Results & Actions Footer */}
          <div className="bg-[#3e3d32] border-t border-white/10 flex flex-col">
            
            {/* Conditional Results View */}
            {runResults && runResults.length > 0 && (
              <div className="max-h-60 overflow-y-auto custom-scrollbar border-b border-white/5">
                <div className="sticky top-0 bg-[#3e3d32]/95 backdrop-blur px-4 py-2 border-b border-white/5 flex justify-between items-center z-10">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Test Results</h3>
                  <div className="text-xs font-mono">
                     <span className="text-emerald-400">{passedTests} Passed</span> / <span className="text-rose-400">{failedTests} Failed</span>
                  </div>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {runResults.map((result, index) => (
                    <div key={index} className={`alert ${getStatusColorClass(result.status?.id)} py-2 px-3 rounded bg-opacity-10 border-l-4 border-opacity-50`}>
                      <div className="flex justify-between w-full items-center">
                        <span className="text-xs font-bold opacity-90">Test {index + 1}: {getStatusText(result.status?.id)}</span>
                        {result.runtime && <span className="text-[10px] font-mono opacity-60 bg-black/30 px-1 rounded">{result.runtime}ms</span>}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-white/5 space-y-3">
                  {runResults.map((result, index) => (
                    result.status?.id !== 3 && (
                      <div key={`detail-${index}`} className="bg-[#272822] rounded-lg p-3 border border-white/5 text-xs">
                        <div className="font-bold text-gray-300 mb-2">Test {index + 1} Details:</div>
                        {result.stdout && (
                          <div className="mb-2">
                            <span className="text-cyan-400">Actual Output:</span>
                            <div className="bg-black/50 p-2 rounded font-mono text-[11px] text-gray-300 mt-1 max-h-20 overflow-y-auto whitespace-pre-wrap break-words">
                              {decodeBase64(result.stdout)}
                            </div>
                          </div>
                        )}
                        {result.expected_output && (
                          <div className="mb-2">
                            <span className="text-emerald-400">Expected Output:</span>
                            <div className="bg-black/50 p-2 rounded font-mono text-[11px] text-gray-300 mt-1 max-h-20 overflow-y-auto whitespace-pre-wrap break-words">
                              {decodeBase64(result.expected_output)}
                            </div>
                          </div>
                        )}
                        {result.stderr && (
                          <div className="mb-2">
                            <span className="text-rose-400">Error:</span>
                            <div className="bg-black/50 p-2 rounded font-mono text-[11px] text-gray-300 mt-1 max-h-20 overflow-y-auto whitespace-pre-wrap break-words">
                              {decodeBase64(result.stderr)}
                            </div>
                          </div>
                        )}
                        {result.compile_output && (
                          <div className="mb-2">
                            <span className="text-amber-400">Compile Error:</span>
                            <div className="bg-black/50 p-2 rounded font-mono text-[11px] text-gray-300 mt-1 max-h-20 overflow-y-auto whitespace-pre-wrap break-words">
                              {decodeBase64(result.compile_output)}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="p-4 flex justify-between items-center">
               <div className="text-xs text-gray-500 flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
                 {isRunning ? 'Compiling...' : 'Ready to code'}
               </div>
               <div className="flex gap-3">
                 <button 
                  className="btn btn-sm btn-ghost text-gray-400 hover:text-white normal-case font-normal"
                  onClick={() => setCode("")}
                 >
                   Reset
                 </button>
                 <button 
                  className={`btn btn-sm px-6 border-0 bg-[#238636] hover:bg-[#2ea043] text-white normal-case font-medium ${isRunning ? 'loading' : ''}`}
                  onClick={handleRunCode}
                  disabled={isRunning || !code}
                 >
                   {!isRunning && (
                     <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="mr-2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                   )}
                   Run Code
                 </button>
                 <button 
                  className={`btn btn-sm px-6 border-0 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white normal-case font-medium shadow-lg shadow-cyan-900/20 ${isSubmitting ? 'loading' : ''}`}
                  onClick={handleSubmitSolution}
                  disabled={isSubmitting || !code}
                 >
                   Submit Solution
                 </button>
               </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* 
         * CRITICAL FIX FOR CURSOR ALIGNMENT 
         * This forces the textarea and the pre/code blocks to match exactly.
         */
        .editor-wrapper {
          isolation: isolate; /* Creates a new stacking context */
          background-color: #272822 !important;
        }
        .editor-wrapper textarea,
        .editor-wrapper pre,
        .editor-wrapper code {
          font-family: "JetBrains Mono", "Fira Code", monospace !important;
          font-size: 14px !important;
          line-height: 1.5 !important;
          letter-spacing: normal !important;
          white-space: pre !important;
        }
        
        .code-area-textarea {
          outline: none !important;
          caret-color: white !important;
        }
        
        /* Make syntax highlighting more vibrant */
        .editor-wrapper pre {
          background-color: transparent !important;
          margin: 0 !important;
        }

        /* Scrollbars */
        .custom-scrollbar::-webkit-scrollbar { width: 10px; height: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #272822; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #555; border-radius: 99px; border: 2px solid #272822; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #888; }
      `}</style>
    </div>
  );
}

export default ProblemPage;