"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Mail,
  Phone,
  MapPin,
  Code,
  Edit2,
  Upload,
  Loader2,
  Save,
  Check,
  X
} from "lucide-react"
import { useEffect, useState } from "react"

// --- ADD SKILL WIDGET (Fixed: No nested buttons/inputs) ---
const AddSkillWidget = ({ onAdd }) => {
  const [value, setValue] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const handleSave = (e) => {
    e?.stopPropagation()
    if (value.trim()) {
      onAdd(value)
      setValue("")
      // Keep open to add more, or setIsOpen(false) to close
    }
  }

  const toggleOpen = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  return (
    <div 
        className={`skill-wrapper-container ${isOpen ? 'active' : ''}`} 
        onClick={(e) => e.stopPropagation()}
    >
      <style jsx>{`
        .skill-wrapper-container {
            position: relative;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .wrapper {
          --background: #62abff;
          --icon-color: #414856;
          --shape-color-01: #b8cbee;
          --shape-color-02: #7691e8;
          --shape-color-03: #fdd053;
          --width: 40px;
          --height: 40px;
          --border-radius: 40px;
          width: var(--width);
          height: var(--height);
          position: relative;
          border-radius: var(--border-radius);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        /* The Toggle Button (Visual) */
        .wrapper .btn {
          background: var(--background);
          width: var(--width);
          height: var(--height);
          position: relative;
          z-index: 3;
          border-radius: var(--border-radius);
          box-shadow: 0 10px 30px rgba(65, 72, 86, 0.05);
          display: flex;
          justify-content: center;
          align-items: center;
          transition: transform 0.2s;
          cursor: pointer;
        }

        /* Plus icon using pseudo elements */
        .wrapper .btn::before,
        .wrapper .btn::after {
          content: "";
          display: block;
          position: absolute;
          border-radius: 4px;
          background: #fff;
          transition: transform 0.3s;
        }
        .wrapper .btn::before { width: 4px; height: 20px; }
        .wrapper .btn::after { width: 20px; height: 4px; }
        
        /* The Pop-out Input Area */
        .wrapper .tooltip {
          width: 40px;
          height: 40px;
          border-radius: 70px;
          position: absolute;
          background: #fff;
          z-index: 2;
          padding: 0;
          box-shadow: 0 10px 30px rgba(65, 72, 86, 0.15);
          opacity: 0;
          top: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          pointer-events: none;
          overflow: hidden;
        }
        
        .skill-input {
          width: 100%;
          height: 100%;
          border: none;
          outline: none;
          background: transparent;
          padding: 0 40px 0 15px;
          font-size: 14px;
          color: #333;
          display: none; /* Hidden until active */
        }

        .save-btn {
          position: absolute;
          right: 5px;
          top: 50%;
          transform: translateY(-50%);
          background: #62abff;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: none;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          color: white;
          transition: background 0.2s;
        }
        .save-btn:hover { background: #4a9dec; }

        .wrapper > svg {
          width: 150px;
          height: 150px;
          position: absolute;
          z-index: 1;
          transform: scale(0);
          pointer-events: none;
        }
        .wrapper > svg .shape {
          fill: none;
          stroke: none;
          stroke-width: 3px;
          stroke-linecap: round;
          stroke-linejoin: round;
          transform-origin: 50% 20%;
        }

        /* --- ACTIVE STATE (Controlled by React 'active' class) --- */
        
        .skill-wrapper-container.active .wrapper > svg {
          animation: pang-animation 1.2s ease-out forwards;
        }
        .skill-wrapper-container.active .btn {
          transform: rotate(45deg);
        }
        .skill-wrapper-container.active .tooltip {
          width: 180px;
          height: 50px;
          top: -65px;
          opacity: 1;
          pointer-events: auto;
        }
        
        .skill-wrapper-container.active .tooltip .skill-input,
        .skill-wrapper-container.active .tooltip .save-btn {
          display: flex;
        }

        /* Floating Shapes Animation positions */
        .skill-wrapper-container.active .shape:nth-of-type(1) { transform: translate(25px, 30%) rotate(40deg); }
        .skill-wrapper-container.active .shape:nth-of-type(2) { transform: translate(-4px, 30%) rotate(80deg); }
        .skill-wrapper-container.active .shape:nth-of-type(3) { transform: translate(12px, 30%) rotate(120deg); }
        .skill-wrapper-container.active .shape:nth-of-type(4) { transform: translate(8px, 30%) rotate(160deg); }
        .skill-wrapper-container.active .shape:nth-of-type(5) { transform: translate(21px, 30%) rotate(200deg); }
        .skill-wrapper-container.active .shape:nth-of-type(6) { transform: translate(0px, 30%) rotate(240deg); }
        .skill-wrapper-container.active .shape:nth-of-type(7) { transform: translate(17px, 30%) rotate(280deg); }
        .skill-wrapper-container.active .shape:nth-of-type(8) { transform: translate(-3px, 30%) rotate(320deg); }
        .skill-wrapper-container.active .shape:nth-of-type(9) { transform: translate(25px, 30%) rotate(360deg); }

        @keyframes pang-animation {
          0% { transform: scale(0); opacity: 0; }
          40% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.1); opacity: 0; }
        }
      `}</style>

      <div className="wrapper">
        <div className="btn" role="button" onClick={toggleOpen}></div>
        
        <div className="tooltip" onClick={(e) => e.stopPropagation()}>
          <input 
            type="text" 
            className="skill-input" 
            placeholder="Add skill..." 
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave(e)}
            onClick={(e) => e.stopPropagation()} // Prevent accordion close
          />
          <div className="save-btn" role="button" onClick={handleSave}>
            <Check size={14} />
          </div>
        </div>

        <svg viewBox="0 0 300 300">
           <use href="#shape-01" className="shape" />
           <use href="#shape-02" className="shape" />
           <use href="#shape-03" className="shape" />
           <use href="#shape-04" className="shape" />
           <use href="#shape-05" className="shape" />
           <use href="#shape-06" className="shape" />
           <use href="#shape-07" className="shape" />
           <use href="#shape-08" className="shape" />
           <use href="#shape-09" className="shape" />
        </svg>
      </div>
    </div>
  )
}

export function ProfileView() {
  const [profile, setProfile] = useState({
    personalInfo: {
      name: "",
      email: "",
      phone: "",
      location: "",
      title: "",
      summary: "",
      avatar: "", 
    },
    skills: {
      technical: [],
      soft: [],
    },
    resumeUploaded: false,
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingSection, setEditingSection] = useState(null)
  
  // --- 1. FETCH DATA FROM BACKEND ---
  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, {
        method: 'GET',
        credentials: 'include' 
      })
      
      if (res.ok) {
        const data = await res.json()
        setProfile({
            personalInfo: {
                name: data.name || "",
                email: data.email || "",
                phone: data.phone || "",
                location: data.location || "",
                title: data.experience?.[0]?.title || "", 
                summary: data.summary || "",
                avatar: data.avatar || "" 
            },
            skills: {
                technical: data.skills || [],
                soft: [] 
            },
            resumeUploaded: true 
        })
      }
    } catch (error) {
      console.error("Failed to fetch profile", error)
    } finally {
      setIsLoading(false)
    }
  }

  // --- 2. SAVE DATA TO BACKEND ---
  const saveProfile = async () => {
    setIsSaving(true)
    try {
        const backendPayload = {
            name: profile.personalInfo.name,
            email: profile.personalInfo.email,
            phone: profile.personalInfo.phone,
            location: profile.personalInfo.location,
            summary: profile.personalInfo.summary,
            skills: [...profile.skills.technical, ...profile.skills.soft],
            avatar: profile.personalInfo.avatar
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(backendPayload)
        })

        if (res.ok) {
            setEditingSection(null)
        }
    } catch (error) {
        console.error("Failed to save", error)
    } finally {
        setIsSaving(false)
    }
  }

  // --- 3. SKILL HANDLERS ---
  const handleSkillAdd = (type, skillName) => {
    if (!skillName.trim()) return
    const updatedSkills = {
      ...profile.skills,
      [type]: [...profile.skills[type], skillName.trim()],
    }
    setProfile({ ...profile, skills: updatedSkills })
  }

  const removeSkill = (type, idx) => {
    const updated = [...profile.skills[type]]
    updated.splice(idx, 1)
    setProfile({ ...profile, skills: { ...profile.skills, [type]: updated } })
  }

  // --- 4. UPLOAD HANDLERS ---
  const handleResumeUpload = async (file) => {
    const formData = new FormData()
    formData.append('resume', file)
    
    setIsLoading(true);

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resume/upload`, {
            method: 'POST',
            credentials: 'include',
            body: formData
        })
        
        if (res.ok) {
            const data = await res.json()
            const newProfileData = data.profile;
            
            setProfile(prev => ({
                ...prev,
                personalInfo: {
                    ...prev.personalInfo,
                    name: newProfileData.name || prev.personalInfo.name,
                    email: newProfileData.email || prev.personalInfo.email,
                    phone: newProfileData.phone || prev.personalInfo.phone,
                    location: newProfileData.location || prev.personalInfo.location,
                    summary: newProfileData.summary || prev.personalInfo.summary,
                    title: newProfileData.experience?.[0]?.title || prev.personalInfo.title,
                    avatar: newProfileData.avatar || prev.personalInfo.avatar 
                },
                skills: {
                    ...prev.skills,
                    technical: newProfileData.skills || [],
                    soft: prev.skills.soft 
                },
                resumeUploaded: true
            }))

            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                const userObj = JSON.parse(storedUser);
                userObj.skills = newProfileData.skills || [];
                localStorage.setItem("user", JSON.stringify(userObj));
            }
        }
    } catch (error) {
        console.error("Upload failed", error)
    } finally {
        setIsLoading(false);
    }
  }

  const handleAvatarUpload = (file) => {
    if (file.size > 2 * 1024 * 1024) {
        alert("File is too big! Please upload an image under 2MB.");
        return;
    }

    const reader = new FileReader()
    
    reader.onload = async () => {
      const base64Image = reader.result;

      setProfile(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          avatar: base64Image,
        },
      }))

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ avatar: base64Image }) 
        })

        if (!res.ok) console.error("Failed to save avatar to server")
      } catch (error) {
        console.error("Network error saving avatar", error)
      }
    }
    
    reader.readAsDataURL(file)
  }

  // --- STYLING CONSTANTS ---
  const btnPrimary = "bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
  const btnOutline = "border-slate-200 dark:border-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50"
  const inputFocus = "focus-visible:ring-slate-400 dark:focus-visible:ring-slate-500"

  if (isLoading) {
      return <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      
      {/* GLOBAL SVG SYMBOLS FOR ADD WIDGET */}
      <svg style={{ display: 'none' }} xmlns="http://www.w3.org/2000/svg">
        <symbol id="shape-01" viewBox="0 0 300 300"><polygon points="155.77 140.06 141.08 152.42 159.12 158.96 155.77 140.06" stroke="var(--shape-color-03)"></polygon></symbol>
        <symbol id="shape-02" viewBox="0 0 300 300"><g stroke="var(--shape-color-02)"><line y2="152.29" x2="141.54" y1="146.73" x1="158.66"></line><line y2="158.07" x2="152.88" y1="140.95" x1="147.32"></line></g></symbol>
        <symbol id="shape-03" viewBox="0 0 300 300"><circle r="13" cy="149.51" cx="150.1" stroke="var(--shape-color-01)"></circle></symbol>
        <symbol id="shape-04" viewBox="0 0 300 300"><circle r="4" cy="149.51" cx="150.1" fill="var(--shape-color-01)"></circle></symbol>
        <symbol id="shape-05" viewBox="0 0 300 300"><rect transform="translate(40.44 -31.76) rotate(13.94)" height="18" width="18" y="140.51" x="141.1" stroke="var(--shape-color-03)"></rect></symbol>
        <symbol id="shape-06" viewBox="0 0 300 300"><g stroke="var(--shape-color-02)"><line y2="146.24" x2="141.72" y1="152.78" x1="158.48"></line><line y2="157.89" x2="146.83" y1="141.13" x1="153.37"></line></g></symbol>
        <symbol id="shape-07" viewBox="0 0 300 300"><rect transform="translate(-42.94 62.23) rotate(-20.56)" height="24" width="24" y="137.51" x="138.1" stroke="var(--shape-color-03)"></rect></symbol>
        <symbol id="shape-08" viewBox="0 0 300 300"><circle r="4" cy="149.51" cx="150.1" fill="var(--shape-color-01)"></circle></symbol>
        <symbol id="shape-09" viewBox="0 0 300 300"><circle r="8" cy="149.51" cx="150.1" stroke="var(--shape-color-01)"></circle></symbol>
      </svg>

      {/* Personal Info Card */}
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            
            {/* Avatar Section */}
            <div className="relative">
              <Avatar className="size-24 border-2 border-slate-300 dark:border-slate-600">
                {profile.personalInfo.avatar ? (
                  <AvatarImage src={profile.personalInfo.avatar} />
                ) : (
                  <AvatarFallback className="bg-slate-400 dark:bg-slate-700 text-white text-3xl font-bold">
                    {profile.personalInfo.name
                      ? profile.personalInfo.name.split(" ").map((n) => n[0]).join("")
                      : "U"}
                  </AvatarFallback>
                )}
              </Avatar>

              <input
                type="file"
                id="avatarUpload"
                className="hidden"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])}
              />

              <label htmlFor="avatarUpload" className="absolute bottom-0 right-0 cursor-pointer">
                <div className={`size-6 flex items-center justify-center rounded-md border ${btnOutline} bg-background`}>
                  <Upload className="size-3" />
                </div>
              </label>
            </div>

            <div className="flex-1 space-y-4 w-full">
              {editingSection === "personal" ? (
                <div className="space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Input
                      className={inputFocus}
                      placeholder="Full Name"
                      value={profile.personalInfo.name}
                      onChange={(e) => setProfile({ ...profile, personalInfo: { ...profile.personalInfo, name: e.target.value } })}
                    />
                    <Input
                      className={inputFocus}
                      placeholder="Title"
                      value={profile.personalInfo.title}
                      onChange={(e) => setProfile({ ...profile, personalInfo: { ...profile.personalInfo, title: e.target.value } })}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <Input
                      className={inputFocus}
                      placeholder="Email"
                      value={profile.personalInfo.email}
                      onChange={(e) => setProfile({ ...profile, personalInfo: { ...profile.personalInfo, email: e.target.value } })}
                    />
                    <Input
                      className={inputFocus}
                      placeholder="Phone"
                      value={profile.personalInfo.phone}
                      onChange={(e) => setProfile({ ...profile, personalInfo: { ...profile.personalInfo, phone: e.target.value } })}
                    />
                  </div>

                  <Input
                    className={inputFocus}
                    placeholder="Location"
                    value={profile.personalInfo.location}
                    onChange={(e) => setProfile({ ...profile, personalInfo: { ...profile.personalInfo, location: e.target.value } })}
                  />

                  <Textarea
                    className={inputFocus}
                    placeholder="Summary"
                    value={profile.personalInfo.summary}
                    onChange={(e) => setProfile({ ...profile, personalInfo: { ...profile.personalInfo, summary: e.target.value } })}
                  />

                  <div className="flex justify-end gap-2">
                    <Button onClick={() => setEditingSection(null)} variant="outline" className={btnOutline}>
                      Cancel
                    </Button>
                    <Button onClick={saveProfile} className={btnPrimary} disabled={isSaving}>
                      {isSaving && <Loader2 className="size-4 mr-2 animate-spin" />}
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-3xl font-bold">{profile.personalInfo.name || "Your Name"}</h2>
                      <p className="text-lg text-slate-900 dark:text-slate-200 font-medium">
                        {profile.personalInfo.title || "Job Title"}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingSection("personal")}
                      className={`flex items-center gap-1 ${btnOutline}`}
                    >
                      <Edit2 className="size-4" /> Edit
                    </Button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 text-sm text-muted-foreground mt-2">
                    <div className="flex items-center gap-2">
                      <Mail className="size-4" /> {profile.personalInfo.email || "No email"}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="size-4" /> {profile.personalInfo.phone || "No phone"}
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <MapPin className="size-4" /> {profile.personalInfo.location || "No location"}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mt-2">
                    {profile.personalInfo.summary || "Add a summary to your profile..."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resume Upload */}
      <Card className="border-border/50">
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
          <p className="text-sm text-muted-foreground">
            {profile.resumeUploaded ? "Resume Uploaded" : "No resume uploaded yet"}
          </p>

          <input
            type="file"
            className="hidden"
            id="resumeUpload"
            accept=".pdf"
            onChange={(e) => e.target.files?.[0] && handleResumeUpload(e.target.files[0])}
          />

          <label htmlFor="resumeUpload">
            <style jsx>{`
                .custom-resume-btn {
                    /* Default Colors: Inherit from Parent (controlled by Tailwind below) */
                    color: inherit; 
                    /* Glassmorphism Background */
                    background: rgba(var(--foreground-rgb), 0.05);
                    padding: 10px 15px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    overflow: hidden;
                    font-size: 0.9rem;
                    font-weight: 600;
                    gap: 8px;
                    border-radius: 5px;
                    margin: 0 5px;
                    transition: 0.2s;
                    border: 1px solid transparent;
                    cursor: pointer;
                }

                .custom-resume-btn:hover {
                    border-color: currentColor;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }

                .custom-resume-btn:active {
                    transform: translateY(1px);
                    box-shadow: none;
                }
            `}</style>
            
            <a className="custom-resume-btn text-black bg-zinc-100 hover:bg-zinc-200 dark:text-white dark:bg-zinc-800 dark:hover:bg-zinc-700">
                <svg viewBox="0 0 256 256" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M74.34 85.66a8 8 0 0 1 11.32-11.32L120 108.69V24a8 8 0 0 1 16 0v84.69l34.34-34.35a8 8 0 0 1 11.32 11.32l-48 48a8 8 0 0 1-11.32 0ZM240 136v64a16 16 0 0 1-16 16H32a16 16 0 0 1-16-16v-64a16 16 0 0 1 16-16h52.4a4 4 0 0 1 2.83 1.17L111 145a24 24 0 0 0 34 0l23.8-23.8a4 4 0 0 1 2.8-1.2H224a16 16 0 0 1 16 16m-40 32a12 12 0 1 0-12 12a12 12 0 0 0 12-12" fill="currentColor"></path>
                </svg>
                {profile.resumeUploaded ? "Update Resume" : "Upload Resume"}
            </a>
          </label>
        </CardContent>
      </Card>

      {/* Skills Accordion */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
                <CardTitle>Skills</CardTitle>
                <CardDescription>Manage your technical expertise</CardDescription>
            </div>
            <Button size="sm" onClick={saveProfile} disabled={isSaving} variant="outline" className={btnOutline}>
                <Save className="size-4 mr-2"/> Save Skills
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Accordion type="single" collapsible className="w-full" defaultValue="technical">
            {/* Technical */}
            <AccordionItem value="technical">
              <AccordionTrigger className="hover:no-underline flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Code className="size-5" />
                  <span className="font-semibold">Tech Skills</span>
                </div>
                
                {/* NEW ADD SKILL WIDGET (Fixed: No input checkbox / button nesting) */}
                <AddSkillWidget onAdd={(val) => handleSkillAdd("technical", val)} />

              </AccordionTrigger>

              <AccordionContent className="pt-2 flex flex-wrap gap-2">
                {profile.skills.technical.length ? (
                  profile.skills.technical.map((skill, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-3 py-1 border rounded-full text-sm">
                      <span>{skill}</span>
                      <button onClick={() => removeSkill("technical", idx)} className="text-muted-foreground hover:text-red-500">
                        <X className="size-3" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No technical skills added</p>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Soft Skills */}
            <AccordionItem value="soft">
              <AccordionTrigger className="hover:no-underline flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Code className="size-5" />
                  <span className="font-semibold">Soft Skills</span>
                </div>
                
                <AddSkillWidget onAdd={(val) => handleSkillAdd("soft", val)} />

              </AccordionTrigger>

              <AccordionContent className="pt-2 flex flex-wrap gap-2">
                {profile.skills.soft.length ? (
                  profile.skills.soft.map((skill, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-3 py-1 border rounded-full text-sm">
                      <span>{skill}</span>
                      <button onClick={() => removeSkill("soft", idx)} className="text-muted-foreground hover:text-red-500">
                        <X className="size-3" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No soft skills added</p>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}
