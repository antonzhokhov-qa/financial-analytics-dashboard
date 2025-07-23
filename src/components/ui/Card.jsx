import { forwardRef } from 'react'
import { clsx } from 'clsx'

const Card = forwardRef(({ 
  className, 
  variant = 'default',
  blur = true,
  border = true,
  children, 
  ...props 
}, ref) => {
  const baseClasses = 'rounded-2xl overflow-hidden transition-all duration-200'
  
  const variants = {
    default: 'bg-white/5 hover:bg-white/10',
    solid: 'bg-gray-800',
    gradient: 'bg-gradient-to-br from-white/10 to-white/5',
    glass: 'bg-white/[0.02]',
    primary: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20'
  }
  
  const blurClass = blur ? 'backdrop-blur-xl' : ''
  const borderClass = border ? 'border border-white/10 hover:border-white/20' : ''
  
  return (
    <div
      ref={ref}
      className={clsx(
        baseClasses,
        variants[variant],
        blurClass,
        borderClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})

Card.displayName = 'Card'

const CardHeader = ({ className, children, ...props }) => (
  <div className={clsx('p-6 pb-0', className)} {...props}>
    {children}
  </div>
)

const CardContent = ({ className, children, ...props }) => (
  <div className={clsx('p-6', className)} {...props}>
    {children}
  </div>
)

const CardFooter = ({ className, children, ...props }) => (
  <div className={clsx('p-6 pt-0', className)} {...props}>
    {children}
  </div>
)

const CardTitle = ({ className, children, ...props }) => (
  <h3 className={clsx('text-lg font-semibold text-white', className)} {...props}>
    {children}
  </h3>
)

const CardDescription = ({ className, children, ...props }) => (
  <p className={clsx('text-sm text-gray-400 mt-1', className)} {...props}>
    {children}
  </p>
)

export { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } 