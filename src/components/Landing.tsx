import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Brain,
  Zap,
  Layers,
  Target,
  ShieldCheck,
  Smartphone,
  Upload,
  Sparkles,
  CheckCircle2,
  Github,
  Linkedin,
  Menu,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import heroImage from "@/assets/hero-animals.jpg";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const features = [
  { icon: Brain, title: "AI Image Classification", desc: "State-of-the-art deep learning model trained on thousands of cattle and buffalo images." },
  { icon: Zap, title: "Fast Prediction", desc: "Get results in under a second with our optimized inference pipeline." },
  { icon: Layers, title: "Breed Identification", desc: "Identify specific breeds like Holstein, Jersey, Murrah, Nili-Ravi and more." },
  { icon: Target, title: "High Accuracy", desc: "98.7% top-1 accuracy on the validation set with robust augmentation." },
  { icon: ShieldCheck, title: "Secure Upload", desc: "Your images are encrypted in transit and never shared with third parties." },
  { icon: Smartphone, title: "Mobile Friendly", desc: "Fully responsive across desktop, tablet, and mobile devices." },
];

const steps = [
  { icon: Upload, title: "Upload Image", desc: "Drag & drop or browse any JPG/PNG image of an animal." },
  { icon: Sparkles, title: "AI Processes Image", desc: "Our neural network analyzes visual features in milliseconds." },
  { icon: CheckCircle2, title: "Get Prediction", desc: "Receive animal type, breed and confidence — instantly." },
];

const testimonials = [
  { name: "Dr. Anika Sharma", role: "Veterinary Researcher", quote: "The breed identification saves us hours during herd assessments. Accuracy is remarkable." },
  { name: "Ramesh Patel", role: "Dairy Farm Owner", quote: "A must-have for anyone managing mixed livestock. Simple, fast, and precise." },
  { name: "Prof. Chen Li", role: "Agricultural University", quote: "We integrated CattleAI into our animal science curriculum. Students love it." },
];

const faqs = [
  { q: "What image formats are supported?", a: "JPG, JPEG and PNG up to 10 MB per image." },
  { q: "How accurate is the model?", a: "Our current production model reaches 98.7% top-1 accuracy on cow vs. buffalo classification and 94% on breed-level prediction." },
  { q: "Is my data private?", a: "Yes — uploads are encrypted, processed transiently, and are never used to retrain our models without explicit consent." },
  { q: "Can I use CattleAI for research?", a: "Absolutely. We provide academic access with dataset export and citation support." },
];

export default function Landing() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-white shadow-elegant">
              <Brain className="h-5 w-5" />
            </div>
            <span className="font-display text-lg font-bold">CattleAI</span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">Features</a>
            <a href="#how" className="text-sm text-muted-foreground hover:text-foreground">How it works</a>
            <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground">FAQ</a>
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
            <Link to="/register">
              <Button size="sm" className="gradient-primary text-white shadow-elegant hover:opacity-95">
                Get Started
              </Button>
            </Link>
          </div>
          <button onClick={() => setOpen(!open)} className="md:hidden" aria-label="Menu">
            <Menu className="h-6 w-6" />
          </button>
        </div>
        {open && (
          <div className="border-t border-border md:hidden">
            <div className="flex flex-col gap-3 p-4">
              <a href="#features" onClick={() => setOpen(false)}>Features</a>
              <a href="#how" onClick={() => setOpen(false)}>How it works</a>
              <a href="#faq" onClick={() => setOpen(false)}>FAQ</a>
              <div className="flex gap-2 pt-2">
                <Link to="/login" className="flex-1"><Button variant="outline" className="w-full">Login</Button></Link>
                <Link to="/register" className="flex-1"><Button className="w-full gradient-primary text-white">Get Started</Button></Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden hero-glow">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center"
          >
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Powered by Deep Learning
            </div>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              AI-Based Animal Type <span className="gradient-text">Classification</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Upload an image and let AI identify whether it is a cow or buffalo — and determine
              its breed with research-grade accuracy.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register">
                <Button size="lg" className="gradient-primary text-white shadow-elegant hover:opacity-95">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#how">
                <Button size="lg" variant="outline">Learn More</Button>
              </a>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
              <div><span className="font-display text-2xl font-bold text-foreground">98.7%</span> Accuracy</div>
              <div><span className="font-display text-2xl font-bold text-foreground">40+</span> Breeds</div>
              <div><span className="font-display text-2xl font-bold text-foreground">&lt;1s</span> Prediction</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <div className="absolute -inset-6 rounded-[2rem] gradient-primary opacity-20 blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-elegant">
              <img
                src={heroImage}
                alt="AI classification of cattle and buffalo"
                width={1536}
                height={1024}
                className="h-auto w-full"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Everything you need to classify livestock</h2>
          <p className="mt-4 text-muted-foreground">
            Purpose-built for veterinary, academic, and agricultural workflows.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-accent/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">How it works</h2>
            <p className="mt-4 text-muted-foreground">Three simple steps from image to insight.</p>
          </div>
          <div className="relative mt-14 grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative rounded-2xl border border-border bg-card p-8 text-center shadow-soft"
              >
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl gradient-primary text-white shadow-elegant">
                  <s.icon className="h-6 w-6" />
                </div>
                <div className="mt-4 text-xs font-semibold uppercase tracking-widest text-primary">Step {i + 1}</div>
                <h3 className="mt-2 font-display text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Trusted by researchers & farmers</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <p className="text-sm text-foreground">"{t.quote}"</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full gradient-primary font-semibold text-white">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Frequently asked questions</h2>
        </div>
        <Accordion type="single" collapsible className="mt-10">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-border">
              <AccordionTrigger className="text-left font-medium">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl gradient-primary p-10 text-center text-white shadow-elegant sm:p-16">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Start classifying in seconds</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/90">
            Create your free account and try our AI classifier on your own images today.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/register">
              <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                Create free account
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
          <div>
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-white">
                <Brain className="h-5 w-5" />
              </div>
              <span className="font-display text-lg font-bold">CattleAI</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">AI-powered livestock classification for a smarter agricultural future.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Product</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground">Features</a></li>
              <li><a href="#how" className="hover:text-foreground">How it works</a></li>
              <li><a href="#faq" className="hover:text-foreground">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">About</a></li>
              <li><a href="#" className="hover:text-foreground">Contact</a></li>
              <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Follow</h4>
            <div className="mt-3 flex gap-3">
              <a href="#" aria-label="GitHub" className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground hover:text-foreground"><Github className="h-4 w-4" /></a>
              <a href="#" aria-label="LinkedIn" className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground hover:text-foreground"><Linkedin className="h-4 w-4" /></a>
            </div>
          </div>
        </div>
        <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} CattleAI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
