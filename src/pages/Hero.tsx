
import { FiUser, FiSettings, FiCheckCircle, FiTruck, FiDollarSign, FiBarChart2, FiCalendar, FiShield, FiMessageSquare } from "react-icons/fi";
import logo from "../assets/logo.png";

export const LandingPage = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Hero />
            <Features />
            <Benefits />
            <Services />
            <Testimonials />
            <FAQ />
            <ContactSection />
        </div>
    );
};

const Hero = () => {
    return (
        <section className="relative bg-base-200 w-full text-center py-20 px-6 md:px-12 lg:px-24">
            <div className="max-w-4xl mx-auto">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <img src={logo} alt="Company Logo" className="w-24 h-24 md:w-32 md:h-32 object-contain" />
                </div>

                <h1 className="text-4xl md:text-5xl font-bold animate-fade-in">
                    MB&CO Cement Factory Management
                </h1>
                <p className="mt-4 text-lg text-base-content">
                    Streamlining cement production, employee management, and transportation logistics with our integrated platform.
                </p>

                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex items-center gap-4 bg-base-200 text-base-content dark:border p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
                        <FiUser className="text-3xl text-blue-600" />
                        <span className="font-semibold">Employee Management</span>
                    </div>
                    <div className="flex items-center gap-4 bg-base-200 text-base-content dark:border p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
                        <FiTruck className="text-3xl text-blue-600" />
                        <span className="font-semibold">Transportation</span>
                    </div>
                    <div className="flex items-center gap-4 bg-base-200 text-base-content dark:border p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
                        <FiDollarSign className="text-3xl text-blue-600" />
                        <span className="font-semibold">Payment & Taxes</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

const Features = () => {
    const features = [
        {
            icon: <FiUser className="text-4xl text-primary" />,
            title: "Employee Management",
            description: "Track attendance, manage shifts, handle payroll, and maintain employee records seamlessly."
        },
        {
            icon: <FiTruck className="text-4xl text-primary" />,
            title: "Transportation Logistics",
            description: "Monitor fleet location, schedule deliveries, track maintenance, and optimize transportation routes."
        },
        {
            icon: <FiDollarSign className="text-4xl text-primary" />,
            title: "Financial Management",
            description: "Process payments, calculate taxes, generate financial reports, and forecast budget planning."
        },
        {
            icon: <FiBarChart2 className="text-4xl text-primary" />,
            title: "Production Analytics",
            description: "Real-time insights into cement production metrics, quality control, and inventory management."
        },
        {
            icon: <FiCalendar className="text-4xl text-primary" />,
            title: "Scheduling System",
            description: "Organize production schedules, delivery timelines, and employee shifts in one integrated calendar."
        },
        {
            icon: <FiShield className="text-4xl text-primary" />,
            title: "Compliance Monitoring",
            description: "Ensure adherence to industry regulations, tax requirements, and safety standards at all times."
        }
    ];

    return (
        <section id="features" className="py-20 px-6 md:px-12 lg:px-24 bg-base-200">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-base-content">Powerful Features</h2>
                    <p className="mt-4 text-lg text-base-content/70 max-w-3xl mx-auto">
                        Our comprehensive platform offers everything you need to manage your cement factory operations efficiently.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="bg-base-200 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow dark:border">
                            <div className="mb-4">{feature.icon}</div>
                            <h3 className="text-xl font-semibold mb-3 text-base-content">{feature.title}</h3>
                            <p className="text-base-content/70">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};


const Benefits = () => {
    return (
        <section className="py-20 px-6 md:px-12 lg:px-24 bg-base-200">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-base-content">Why Choose MB&CO?</h2>
                    <p className="mt-4 text-lg text-base-content/70 max-w-3xl mx-auto">
                        Benefit from our years of industry experience and purpose-built cement factory management solution.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-base-200 p-8 rounded-xl shadow-sm border">
                        <h3 className="text-2xl font-semibold mb-4 text-base-content">Streamlined Operations</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <FiCheckCircle className="text-green-500 text-xl mt-1 flex-shrink-0" />
                                <span className="text-base-content/70">Reduce administrative overhead by up to 40%</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <FiCheckCircle className="text-green-500 text-xl mt-1 flex-shrink-0" />
                                <span className="text-base-content/70">Optimize transportation routes saving on fuel costs</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <FiCheckCircle className="text-green-500 text-xl mt-1 flex-shrink-0" />
                                <span className="text-base-content/70">Automate repetitive tasks for increased productivity</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <FiCheckCircle className="text-green-500 text-xl mt-1 flex-shrink-0" />
                                <span className="text-base-content/70">Centralize data for better decision-making</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-base-200 p-8 rounded-xl shadow-sm border">
                        <h3 className="text-2xl font-semibold mb-4 text-base-content">Financial Benefits</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <FiCheckCircle className="text-green-500 text-xl mt-1 flex-shrink-0" />
                                <span className="text-base-content/70">Accurate tax calculations preventing compliance issues</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <FiCheckCircle className="text-green-500 text-xl mt-1 flex-shrink-0" />
                                <span className="text-base-content/70">Real-time financial reporting for better cash flow management</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <FiCheckCircle className="text-green-500 text-xl mt-1 flex-shrink-0" />
                                <span className="text-base-content/70">Reduce payroll errors and processing time</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <FiCheckCircle className="text-green-500 text-xl mt-1 flex-shrink-0" />
                                <span className="text-base-content/70">Cost tracking across all operations</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};

const Services = () => {
    return (
        <section id="services" className="py-20 px-6 md:px-12 lg:px-24 bg-base-200">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="md:text-4xl font-bold text-base">Our Services</h2>
                    <p className="mt-4 text-lg text-base-content/70 max-w-3xl mx-auto">
                        Comprehensive solutions tailored specifically for cement factories and production facilities.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-base-200 p-8 rounded-xl border border-blue-100 text-center">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FiSettings className="text-white text-2xl" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3 text-base-content">Management Software</h3>
                        <p className="text-base-content/70 mb-6">
                            End-to-end software solution for cement production, employee management, and logistics.
                        </p>
                        <button className="text-blue-600 font-medium hover:underline">Learn More →</button>
                    </div>

                    <div className="bg-base-200 p-8 rounded-xl border border-blue-100 text-center">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FiMessageSquare className="text-white text-2xl" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3 text-base-content">Consultation Services</h3>
                        <p className="text-base-content/70 mb-6">
                            Expert guidance on optimizing operations, compliance, and financial management.
                        </p>
                        <button className="text-blue-600 font-medium hover:underline">Learn More →</button>
                    </div>

                    <div className="bg-base-200 p-8 rounded-xl border border-blue-100 text-center">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FiBarChart2 className="text-white text-2xl" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3 text-base-content">Analytics & Reporting</h3>
                        <p className="text-base-content/70 mb-6">
                            Customized dashboards and reports for tracking KPIs and business performance.
                        </p>
                        <button className="text-blue-600 font-medium hover:underline">Learn More →</button>
                    </div>
                </div>
            </div>
        </section>
    );
};

const Testimonials = () => {
    const testimonials = [
        {
            quote: "MB&CO transformed how we manage our cement factory. Their transportation tracking alone saved us 22% in logistics costs in the first quarter.",
            name: "Ahmed Hassan",
            role: "Operations Director, Global Cement Inc."
        },
        {
            quote: "The employee management system handles our complex shift schedules perfectly. Payroll that used to take days now happens with a few clicks.",
            name: "Sarah Johnson",
            role: "HR Manager, Concrete Solutions Ltd."
        },
        {
            quote: "Tax compliance was always a headache until we implemented MB&CO's financial management system. Now we're audit-ready year-round.",
            name: "Michael Lee",
            role: "CFO, EastWest Cement"
        }
    ];

    return (
        <section id="testimonials" className="py-20 px-6 md:px-12 lg:px-24 bg-base-200">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-base-content">What Our Clients Say</h2>
                    <p className="mt-4 text-lg text-base-content/70 max-w-3xl mx-auto">
                        Hear from cement industry professionals who've transformed their operations with our platform.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="bg-base-100 p-8 rounded-xl shadow-md">
                            <div className="mb-6 text-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="opacity-20">
                                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                                </svg>
                            </div>
                            <p className="text-base-content/80 mb-6">{testimonial.quote}</p>
                            <div>
                                <p className="font-semibold text-base-content">{testimonial.name}</p>
                                <p className="text-base-content/70 text-sm">{testimonial.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const FAQ = () => {
    const faqs = [
        {
            question: "How does the transportation management system work?",
            answer:
                "Our transportation management system uses GPS tracking to monitor truck locations in real-time. It optimizes delivery routes based on distance, traffic conditions, and delivery priorities. The system also tracks vehicle maintenance schedules, fuel consumption, and driver performance metrics.",
        },
        {
            question: "Can MB&CO handle payroll for different employee types?",
            answer:
                "Yes, our employee management module supports various employment types including full-time, part-time, contract, and seasonal workers. It calculates wages based on hourly rates, salaries, or production metrics, and correctly applies overtime rules, bonuses, and deductions.",
        },
        {
            question: "How does the system help with tax compliance?",
            answer:
                "MB&CO's financial management module automatically calculates various taxes including payroll taxes, sales taxes, and industry-specific taxes. It generates the required reports for tax filings, maintains audit trails, and sends alerts for upcoming tax deadlines.",
        },
        {
            question: "Is the platform customizable for different sizes of cement factories?",
            answer:
                "Absolutely. Our platform scales from small operations to large enterprise facilities. We offer tiered packages with different feature sets, and each implementation is customized to match your specific workflows, reporting needs, and operational requirements.",
        },
        {
            question: "What kind of support does MB&CO provide after implementation?",
            answer:
                "We provide 24/7 technical support, regular software updates, and quarterly system reviews. Our client success team conducts training sessions for new features, and our consultants are available for optimization recommendations as your business evolves.",
        },
        {
            question: "How secure is the data in your system?",
            answer:
                "Security is our top priority. We employ industry-standard encryption for all data, maintain regular backups, and follow strict access control protocols. Our systems comply with relevant data protection regulations, and we conduct regular security audits and penetration testing.",
        },
    ];

    return (
        <section id="faq" className="py-16 px-4 md:px-12 lg:px-24 bg-base-200">
            <div className="max-w-4xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-base-content">
                        Frequently Asked Questions
                    </h2>
                    <p className="mt-4 text-lg text-base-content">
                        Get answers to common questions about our cement factory management solutions.
                    </p>
                </div>

                {/* FAQ List */}
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="collapse collapse-arrow bg-base-200 dark:border shadow-lg rounded-lg">
                            <input type="checkbox" />
                            <div className="collapse-title text-lg font-semibold text-base-content">
                                {faq.question}
                            </div>
                            <div className="collapse-content">
                                <p className="text-gray-600">{faq.answer}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};


type ContactIcon = "phone" | "mail" | "map"

const ContactSection = () => {
    type Contact = {
        label: string,
        value: string,
        icon: ContactIcon
    }
    const contacts: Contact[] = [
        { label: "Phone", value: "+1 (555) 123-4567", icon: "phone" },
        { label: "Email", value: "info@mbco-cement.com", icon: "mail" },
        { label: "Address", value: "Chakwal, Punjab, Pakistan", icon: "map" },
    ]

    return (
        <section id="contact" className="py-20 px-6 md:px-12 lg:px-24 bg-base-200">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left Section */}
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-base-content mb-6">
                            Get in Touch
                        </h2>
                        <p className="text-lg text-base-content/70 mb-8">
                            Ready to transform your cement factory operations? Contact us today for a personalized demo or to discuss your specific needs.
                        </p>

                        <div className="space-y-6">
                            {contacts.map((item, index) => (
                                <div key={index} className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <Icon name={item.icon} />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-base-content">{item.label}</h3>
                                        <p className="text-base-content/70 whitespace-pre-line">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="bg-base-100 p-8 rounded-xl shadow-md">
                        <h3 className="text-2xl font-semibold mb-6 text-base-content">
                            Send us a Message
                        </h3>
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {["Name", "Email"].map((field) => (
                                    <div key={field}>
                                        <label htmlFor={field.toLowerCase()} className="block text-sm font-medium text-base-content mb-1">
                                            {field}
                                        </label>
                                        <input
                                            type={field === "Email" ? "email" : "text"}
                                            id={field.toLowerCase()}
                                            className="w-full px-4 py-2 border border-base-300 rounded-lg focus:ring-primary focus:border-primary bg-base-100 text-base-content"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div>
                                <label htmlFor="company" className="block text-sm font-medium text-base-content mb-1">
                                    Company
                                </label>
                                <input
                                    type="text"
                                    id="company"
                                    className="w-full px-4 py-2 border border-base-300 rounded-lg focus:ring-primary focus:border-primary bg-base-100 text-base-content"
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-base-content mb-1">
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    rows={4}
                                    className="w-full px-4 py-2 border border-base-300 rounded-lg focus:ring-primary focus:border-primary bg-base-100 text-base-content"
                                ></textarea>
                            </div>

                            <button type="submit" className="w-full bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/80 transition">
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

// Icon Component for SVGs
type IconProps = { name: ContactIcon }
const Icon = ({ name }: IconProps) => {
    const icons = {
        phone: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
        ),
        mail: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
        map: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
    };
    return icons[name];
};

export default ContactSection;


