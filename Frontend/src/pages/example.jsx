

function Example({problem}){




    return (
<>

   {problem?.visibleTestCases && problem.visibleTestCases.length > 0 && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest border-b border-white/10 pb-2">Examples</h3>
                    {problem.visibleTestCases.map((example, index) => (
                      <div key={index} className="bg-[#161b22] border border-white/5 rounded-xl overflow-hidden shadow-lg">
                        <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex justify-between items-center">
                          <span className="text-xs font-bold text-gray-400 uppercase">Case {index + 1}</span>
                        </div>
                        <div className="p-4 grid gap-4">
                          <div>
                            <span className="text-xs text-purple-400 font-mono block mb-1 uppercase opacity-70">Input</span>
                            <div className="bg-[#0d1117] p-3 rounded-lg font-mono text-sm text-gray-300 border border-white/5 shadow-inner">
                              {example.input.trim().split('\n').length === 1 
                                ? example.input 
                                : example.input.trim().split('\n').slice(0, -1).join('\n')}
                            </div>
                          </div>
                          <div>
                            <span className="text-xs text-cyan-400 font-mono block mb-1 uppercase opacity-70">Output</span>
                            <div className="bg-[#0d1117] p-3 rounded-lg font-mono text-sm text-gray-300 border border-white/5 shadow-inner">
                              {example.output}
                            </div>
                          </div>
                          {example.input && (
                              <div>
                                <span className="text-xs text-amber-400 font-mono block mb-1 uppercase opacity-70">Target</span>
                                <div className="bg-[#0d1117] p-3 rounded-lg font-mono text-sm text-gray-300 border border-white/5 shadow-inner">
                                  {example.input.trim().split('\n').pop()}
                                </div>
                              </div>
                            )}
                          {example.explanation && (
                            <div className="text-sm text-gray-500 italic border-l-2 border-white/10 pl-3 mt-1">
                              {example.explanation}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

</>




    )
}   export default Example;