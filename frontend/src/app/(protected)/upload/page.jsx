'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { uploadResume, startInterview } from '/src/lib/api';
import { Upload, CheckCircle, Loader, ArrowRight, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import re from '../../../../public/resume.png';

const TECH_COLORS = {
  frontend: 'bg-blue-900/40 text-blue-300',
  backend: 'bg-green-900/40 text-green-300',
  fullstack: 'bg-purple-900/40 text-purple-300',
  mern: 'bg-yellow-900/40 text-yellow-300',
  react: 'bg-cyan-900/40 text-cyan-300',
  nodejs: 'bg-emerald-900/40 text-emerald-300',
  mongodb: 'bg-green-900/40 text-green-300',
  python: 'bg-blue-900/40 text-blue-300',
  html: 'bg-orange-900/40 text-orange-300',
  javascript: 'bg-yellow-900/40 text-yellow-300',
};

const DIFFICULTY_OPTIONS = ['easy', 'medium', 'hard'];

export default function UploadPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [starting, setStarting] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(10);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const res = await uploadResume(formData);
      setResumeData(res.data.resume);
      toast.success('Resume analyzed successfully!');
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const handleStartInterview = async () => {
    if (!resumeData) return;
    setStarting(true);

    try {
      const res = await startInterview({
        resumeId: resumeData.id,
        difficulty,
        questionCount,
      });

      const { sessionId, questions } = res.data;
      sessionStorage.setItem(`questions_${sessionId}`, JSON.stringify(questions));
      router.push(`/interview/${sessionId}`);
    } catch {
      toast.error('Failed to start interview');
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="relative min-h-screen grid-pattern px-4 py-12">

      {/* Glow Background */}
      <div className="bg-glow top-0 left-1/2 -translate-x-1/2" />

      <div className="relative z-10 max-w-2xl mx-auto">

        {/* Back */}
        <button
          onClick={() => router.push('/dashboard')}
          className="text-gray-500 hover:text-gray-300 text-sm mb-6"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold mb-2 text-gradient">
          Upload Your Resume
        </h1>
        <p className="text-gray-400 mb-10">
          AI will analyze your resume and generate personalized questions.
        </p>

        {/* Upload Box */}
        {!resumeData && (
          <div
            {...getRootProps()}
            className={`
              relative rounded-2xl p-12 text-center cursor-pointer transition
              border backdrop-blur-md
              ${isDragActive
                ? 'border-green-400 bg-green-500/10'
                : 'border-white/10 hover:border-white/20 bg-white/5'}
            `}
          >
            <input {...getInputProps()} />

            {uploading ? (
              <div className="flex flex-col items-center gap-4">
                <Loader className="animate-spin text-green-400" size={40} />
                <p className="text-gray-300">Analyzing your resume...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                {/* <div className="p-4 rounded-full bg-white/5 border border-white/10">
                  <Upload className="text-gray-400" size={30} />
                </div> */}

                <Image src={re} width={60} height={60} alt="resume" />

                <p className="dark:text-white text:black font-medium">
                  Drop your resume here
                </p>

                <p className="text-gray-500 text-sm">
                  PDF or Word • Max 5MB
                </p>
              </div>
            )}
          </div>
        )}

        {/* Result */}
        {resumeData && (
          <div className="space-y-6 animate-fade-in">

            {/* Resume Card */}
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="text-green-400" size={20} />
                <h2 className="font-semibold">Resume Analyzed</h2>
              </div>

              <p className="text-sm text-gray-400 mb-2">Tech Stack</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {resumeData.detectedTechStack?.map((tech) => (
                  <span key={tech} className={`badge ${TECH_COLORS[tech]}`}>
                    <Tag size={10} /> {tech}
                  </span>
                ))}
              </div>

              <p className="text-sm text-gray-400 mb-2">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {resumeData.detectedSkills?.slice(0, 12).map((s) => (
                  <span key={s} className="badge bg-white/10 text-gray-300 text-xs">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="card">
              <h2 className="font-semibold mb-4">Interview Settings</h2>

              <div className="grid grid-cols-2 gap-4">
                {/* Difficulty */}
                <div>
                  <p className="text-sm text-gray-400 mb-2">Difficulty</p>
                  <div className="flex gap-2">
                    {DIFFICULTY_OPTIONS.map((d) => (
                      <button
                        key={d}
                        onClick={() => setDifficulty(d)}
                        className={`
                          px-3 py-1.5 rounded-lg text-sm transition
                          ${difficulty === d
                            ? 'bg-green-500 text-white'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'}
                        `}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Range */}
                <div>
                  <p className="text-sm text-gray-400 mb-2">
                    Questions: {questionCount}
                  </p>

                  <input
                    type="range"
                    min={5}
                    max={20}
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full accent-green-400"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setResumeData(null)}
                className="btn-secondary"
              >
                Re-upload
              </button>

              <button
                onClick={handleStartInterview}
                disabled={starting}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {starting ? 'Starting...' : (
                  <>
                    Start Interview <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}