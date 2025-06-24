'use client'

import { useState } from 'react'

interface DiffItem {
  section: string
  original: string | null
  updated: string | null
}

interface DiffResult {
  summary: string
  diffList: DiffItem[]
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [changes, setChanges] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DiffResult | null>(null)
  const [error, setError] = useState('')

  const isValidFileType = (file: File) => {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/octet-stream' // 일부 시스템에서 docx를 이렇게 인식할 수 있음
    ]
    
    const fileName = file.name.toLowerCase()
    const validExtensions = ['.pdf', '.doc', '.docx']
    
    // MIME 타입 또는 파일 확장자로 검증
    return validTypes.includes(file.type) || validExtensions.some(ext => fileName.endsWith(ext))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (isValidFileType(selectedFile)) {
        setFile(selectedFile)
        setError('')
        console.log('파일 타입:', selectedFile.type, '파일명:', selectedFile.name) // 디버깅용
      } else {
        setError(`PDF 또는 Word 문서만 업로드 가능합니다. (현재 파일 타입: ${selectedFile.type})`)
        setFile(null)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.currentTarget.classList.add('dragover')
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.currentTarget.classList.remove('dragover')
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.currentTarget.classList.remove('dragover')
    
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      if (isValidFileType(droppedFile)) {
        setFile(droppedFile)
        setError('')
        console.log('파일 타입:', droppedFile.type, '파일명:', droppedFile.name) // 디버깅용
      } else {
        setError(`PDF 또는 Word 문서만 업로드 가능합니다. (현재 파일 타입: ${droppedFile.type})`)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file || !changes.trim()) {
      setError('원본문서와 변경사항을 모두 입력해주세요.')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('changes', changes)

    try {
      console.log('파일 타입:', file.type, '파일명:', file.name)
      
      const response = await fetch('/api/process-document', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '서버 오류가 발생했습니다.' }))
        throw new Error(errorData.error || `서버 오류 (${response.status})`)
      }

      const data = await response.json()
      
      if (!data.summary || !data.diffList) {
        throw new Error('분석 결과가 올바르지 않습니다.')
      }
      
      setResult(data)
    } catch (err) {
      console.error('클라이언트 오류:', err)
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                스마트 파일 버전 매니저
              </h1>
              <p className="text-gray-600">
                AI 기반 문서 변경사항 분석 시스템
              </p>
            </div>
            <a
              href="/admin"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            >
              ⚙️ 관리자
            </a>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-120px)]">
        {/* 좌측 입력 영역 (2/5 비율) */}
        <div className="w-full lg:w-2/5 p-6 bg-white border-r border-gray-200 overflow-y-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">문서 업로드 및 변경사항 입력</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group">
              <label className="form-label">
                원본문서 <span className="text-red-500">*</span>
              </label>
              <div
                className="upload-area"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {file ? (
                    <div className="text-green-600">
                      <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs">파일이 선택되었습니다</p>
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                      <p className="font-medium text-sm">파일을 드래그하거나 클릭하여 업로드</p>
                      <p className="text-xs">PDF, Word 문서 지원</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="changes" className="form-label">
                변경사항 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="changes"
                value={changes}
                onChange={(e) => setChanges(e.target.value)}
                placeholder="변경할 정보를 입력해 주세요."
                className="form-textarea h-32"
              />
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !file || !changes.trim()}
              className="btn btn-primary w-full"
            >
              {loading ? (
                <>
                  <span className="loading-spinner mr-2"></span>
                  처리 중...
                </>
              ) : (
                '문서 분석하기'
              )}
            </button>
          </form>
        </div>

        {/* 우측 결과 영역 (3/5 비율) */}
        <div className="w-full lg:w-3/5 p-6 bg-gray-50 overflow-y-auto">
          {result ? (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">분석 결과</h2>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">변경사항 요약</h3>
                <p className="text-blue-700 text-sm">{result.summary}</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">상세 변경 목록</h3>
                {result.diffList.map((diff, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="font-medium text-gray-800 mb-3 text-sm">
                      📍 {diff.section}
                    </div>
                    
                    {diff.original && (
                      <div className="mb-3">
                        <div className="text-xs font-medium text-red-700 mb-1">변경 전:</div>
                        <div className="bg-red-50 border border-red-200 rounded p-2 text-sm">
                          {diff.original}
                        </div>
                      </div>
                    )}
                    
                    {diff.updated && (
                      <div className="mb-3">
                        <div className="text-xs font-medium text-green-700 mb-1">변경 후:</div>
                        <div className="bg-green-50 border border-green-200 rounded p-2 text-sm">
                          {diff.updated}
                        </div>
                      </div>
                    )}
                    
                    {!diff.original && diff.updated && (
                      <div className="text-xs font-medium text-blue-700 mb-2">✨ 새로 추가됨</div>
                    )}
                    
                    {diff.original && !diff.updated && (
                      <div className="text-xs font-medium text-red-700 mb-2">🗑️ 삭제됨</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-lg font-medium">분석 결과가 여기에 표시됩니다</p>
                <p className="text-sm mt-2">좌측에서 문서를 업로드하고 변경사항을 입력한 후<br />분석을 실행해주세요.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 